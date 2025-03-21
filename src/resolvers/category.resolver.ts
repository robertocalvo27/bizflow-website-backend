import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { Category } from '../models/Category';
import { 
  CategoryInput, 
  CategoryUpdateInput, 
  CategoryFilterInput,
  CategorySortInput,
  PaginatedCategories
} from '../schema/category.schema';
import { PaginationInput, SortOrder } from '../schema/common.schema';
import { AppDataSource } from '../database/data-source';
import { isAuth } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { FindOptionsWhere, FindOptionsOrder, Like } from 'typeorm';

@Resolver()
export class CategoryResolver {
  private categoryRepository = AppDataSource.getRepository(Category);

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['posts'],
    });
  }

  @Query(() => PaginatedCategories)
  async paginatedCategories(
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: CategoryFilterInput,
    @Arg('sort', { nullable: true }) sort?: CategorySortInput
  ): Promise<PaginatedCategories> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'name';
    const sortOrder = sort?.order || SortOrder.ASC;
    
    // Construir el objeto de condiciones where
    const where: FindOptionsWhere<Category> = {};
    
    // Aplicar filtros si están presentes
    if (filter) {
      // Filtrar por nombre
      if (filter.name) {
        if (filter.name.contains) {
          where.name = Like(`%${filter.name.contains}%`);
        } else if (filter.name.startsWith) {
          where.name = Like(`${filter.name.startsWith}%`);
        } else if (filter.name.endsWith) {
          where.name = Like(`%${filter.name.endsWith}`);
        } else if (filter.name.equals) {
          where.name = filter.name.equals;
        }
      }
      
      // Filtrar por descripción
      if (filter.description) {
        if (filter.description.contains) {
          where.description = Like(`%${filter.description.contains}%`);
        }
      }
      
      // Filtrar por indexable
      if (filter.indexable !== undefined) {
        where.indexable = filter.indexable;
      }
    }
    
    // Construir el objeto de ordenamiento
    const order: FindOptionsOrder<Category> = {
      [sortField]: sortOrder,
    };
    
    // Contar el total de items que coinciden con el filtro
    const totalItems = await this.categoryRepository.count({ where });
    
    // Calcular info de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    // Obtener los items para la página actual
    const items = await this.categoryRepository.find({
      where,
      order,
      skip: offset,
      take: limit,
      relations: ['posts'],
    });
    
    return {
      items,
      pageInfo: {
        totalItems,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  @Query(() => Category, { nullable: true })
  async category(@Arg('id') id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  @Query(() => Category, { nullable: true })
  async categoryBySlug(@Arg('slug') slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['posts'],
    });
  }

  @Query(() => PaginatedCategories)
  async searchCategories(
    @Arg('term') term: string,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('sort', { nullable: true }) sort?: CategorySortInput
  ): Promise<PaginatedCategories> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'name';
    const sortOrder = sort?.order || SortOrder.ASC;
    
    // Iniciar un query builder
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .where('category.name ILIKE :term OR category.description ILIKE :term OR category.metaKeywords ILIKE :term', 
        { term: `%${term}%` });
    
    // Ordenar resultados
    queryBuilder.orderBy(`category.${sortField}`, sortOrder);
    
    // Contar el total de resultados
    const totalItems = await queryBuilder.getCount();
    
    // Aplicar paginación
    queryBuilder.skip(offset).take(limit);
    queryBuilder.leftJoinAndSelect('category.posts', 'posts');
    
    // Ejecutar la consulta
    const items = await queryBuilder.getMany();
    
    // Calcular información de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    return {
      items,
      pageInfo: {
        totalItems,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  @Mutation(() => Category)
  @UseMiddleware(isAuth)
  async createCategory(@Arg('input') input: CategoryInput): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: [{ name: input.name }, { slug: input.slug }],
    });

    if (existingCategory) {
      throw new Error('La categoría ya existe');
    }

    // Generar slug si no se proporciona
    if (!input.slug) {
      input.slug = slugify(input.name);
    }

    const category = this.categoryRepository.create(input);
    return this.categoryRepository.save(category);
  }

  @Mutation(() => Category)
  @UseMiddleware(isAuth)
  async updateCategory(
    @Arg('id') id: string,
    @Arg('input') input: CategoryUpdateInput
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Generar slug si se cambió el nombre y no se proporcionó un nuevo slug
    if (input.name && input.name !== category.name && !input.slug) {
      input.slug = slugify(input.name);
    }

    Object.assign(category, input);
    return this.categoryRepository.save(category);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteCategory(@Arg('id') id: string): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected !== 0;
  }
} 