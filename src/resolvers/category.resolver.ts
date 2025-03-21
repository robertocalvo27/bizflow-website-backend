import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { Category } from '../models/Category';
import { CategoryInput, CategoryUpdateInput } from '../schema/category.schema';
import { AppDataSource } from '../database/data-source';
import { isAuth } from '../middleware/auth';
import { slugify } from '../utils/slugify';

@Resolver()
export class CategoryResolver {
  private categoryRepository = AppDataSource.getRepository(Category);

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['posts'],
    });
  }

  @Query(() => Category, { nullable: true })
  async category(@Arg('id') id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
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