import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, Int } from 'type-graphql';
import { Resource, ResourceType } from '../models/Resource';
import { 
  ResourceInput, 
  ResourceUpdateInput, 
  PaginatedResources, 
  ResourceFilterInput,
  ResourceSortInput,
} from '../schema/resource.schema';
import { PaginationInput } from '../schema/common.schema';
import { AppDataSource } from '../database/data-source';
import { isAuth } from '../middleware/auth';
import { MyContext } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { In, Like, FindOptionsWhere, FindOptionsOrder } from 'typeorm';

@Resolver()
export class ResourceResolver {
  private resourceRepository = AppDataSource.getRepository(Resource);

  @Query(() => [Resource])
  async resources(): Promise<Resource[]> {
    return this.resourceRepository.find({
      relations: ['uploader', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  @Query(() => PaginatedResources)
  async paginatedResources(
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: ResourceFilterInput,
    @Arg('sort', { nullable: true }) sort?: ResourceSortInput
  ): Promise<PaginatedResources> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'createdAt';
    const sortOrder = sort?.order || 'DESC';
    
    // Construir el objeto de condiciones where
    const where: FindOptionsWhere<Resource> = {};
    
    // Aplicar filtros si están presentes
    if (filter) {
      // Filtrar por título
      if (filter.title) {
        if (filter.title.contains) {
          where.title = Like(`%${filter.title.contains}%`);
        } else if (filter.title.startsWith) {
          where.title = Like(`${filter.title.startsWith}%`);
        } else if (filter.title.endsWith) {
          where.title = Like(`%${filter.title.endsWith}`);
        } else if (filter.title.equals) {
          where.title = filter.title.equals;
        }
      }
      
      // Filtrar por descripción
      if (filter.description?.contains) {
        where.description = Like(`%${filter.description.contains}%`);
      }
      
      // Filtrar por tipo de recurso
      if (filter.resourceTypes && filter.resourceTypes.length > 0) {
        where.resourceType = In(filter.resourceTypes);
      }
      
      // Filtrar por categorías
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = In(filter.categoryIds);
      }
      
      // Filtrar por uploaders
      if (filter.uploaderIds && filter.uploaderIds.length > 0) {
        where.uploaderId = In(filter.uploaderIds);
      }
      
      // Filtrar por destacado
      if (filter.featured !== undefined) {
        where.featured = filter.featured;
      }
      
      // Filtrar por público/privado
      if (filter.isPublic !== undefined) {
        where.isPublic = filter.isPublic;
      }
    }
    
    // Construir el objeto de ordenamiento
    const order: FindOptionsOrder<Resource> = {
      [sortField]: sortOrder,
    };
    
    // Contar el total de items que coinciden con el filtro
    const totalItems = await this.resourceRepository.count({ where });
    
    // Calcular info de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    // Obtener los items para la página actual
    const items = await this.resourceRepository.find({
      where,
      order,
      skip: offset,
      take: limit,
      relations: ['uploader', 'category'],
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

  @Query(() => [Resource])
  async publicResources(
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: ResourceFilterInput,
    @Arg('sort', { nullable: true }) sort?: ResourceSortInput
  ): Promise<Resource[]> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'createdAt';
    const sortOrder = sort?.order || 'DESC';
    
    // Construir el objeto de condiciones where
    const where: FindOptionsWhere<Resource> = { isPublic: true };
    
    // Aplicar filtros adicionales si están presentes
    if (filter) {
      if (filter.resourceTypes && filter.resourceTypes.length > 0) {
        where.resourceType = In(filter.resourceTypes);
      }
      
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = In(filter.categoryIds);
      }
      
      if (filter.featured !== undefined) {
        where.featured = filter.featured;
      }
    }
    
    const order: FindOptionsOrder<Resource> = {
      [sortField]: sortOrder,
    };
    
    return this.resourceRepository.find({
      where,
      order,
      skip: offset,
      take: limit,
      relations: ['uploader', 'category'],
    });
  }

  @Query(() => [Resource])
  async featuredResources(): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { featured: true, isPublic: true },
      relations: ['uploader', 'category'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  @Query(() => Resource, { nullable: true })
  async resource(@Arg('id') id: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { id },
      relations: ['uploader', 'category'],
    });
  }

  @Query(() => Resource, { nullable: true })
  async resourceBySlug(@Arg('slug') slug: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { slug },
      relations: ['uploader', 'category'],
    });
  }

  @Query(() => [Resource])
  async resourcesByCategory(
    @Arg('categoryId') categoryId: string,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('sort', { nullable: true }) sort?: ResourceSortInput
  ): Promise<Resource[]> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'createdAt';
    const sortOrder = sort?.order || 'DESC';
    
    const order: FindOptionsOrder<Resource> = {
      [sortField]: sortOrder,
    };
    
    return this.resourceRepository.find({
      where: { categoryId, isPublic: true },
      relations: ['uploader', 'category'],
      order,
      skip: offset,
      take: limit,
    });
  }

  @Mutation(() => Resource)
  @UseMiddleware(isAuth)
  async createResource(
    @Arg('input') input: ResourceInput,
    @Ctx() { payload }: MyContext
  ): Promise<Resource> {
    // Generar slug si no se proporciona
    if (!input.slug) {
      input.slug = slugify(input.title);
    }

    // Asignar el usuario autenticado como uploader si no se especifica
    const uploaderId = input.uploaderId || payload.id;

    const resource = this.resourceRepository.create({
      ...input,
      uploaderId,
    });

    return this.resourceRepository.save(resource);
  }

  @Mutation(() => Resource)
  @UseMiddleware(isAuth)
  async updateResource(
    @Arg('id') id: string,
    @Arg('input') input: ResourceUpdateInput,
    @Ctx() { payload }: MyContext
  ): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!resource) {
      throw new Error('Recurso no encontrado');
    }

    // Verificar si el usuario es el uploader o un admin
    if (resource.uploaderId !== payload.id && payload.role !== 'admin') {
      throw new Error('No tienes permiso para editar este recurso');
    }

    // Generar slug si se cambió el título y no se proporcionó un nuevo slug
    if (input.title && input.title !== resource.title && !input.slug) {
      input.slug = slugify(input.title);
    }

    Object.assign(resource, input);
    return this.resourceRepository.save(resource);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteResource(
    @Arg('id') id: string,
    @Ctx() { payload }: MyContext
  ): Promise<boolean> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!resource) {
      throw new Error('Recurso no encontrado');
    }

    // Verificar si el usuario es el uploader o un admin
    if (resource.uploaderId !== payload.id && payload.role !== 'admin') {
      throw new Error('No tienes permiso para eliminar este recurso');
    }

    const result = await this.resourceRepository.delete(id);
    return result.affected !== 0;
  }

  @Mutation(() => Resource)
  @UseMiddleware(isAuth)
  async incrementDownloadCount(
    @Arg('id') id: string
  ): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id }
    });

    if (!resource) {
      throw new Error('Recurso no encontrado');
    }

    resource.downloadCount += 1;
    return this.resourceRepository.save(resource);
  }
} 