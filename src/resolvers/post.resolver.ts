import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, Int } from 'type-graphql';
import { Post } from '../models/Post';
import { PostInput, PostUpdateInput } from '../schema/post.schema';
import { AppDataSource } from '../database/data-source';
import { isAuth } from '../middleware/auth';
import { MyContext } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { In } from 'typeorm';

@Resolver()
export class PostResolver {
  private postRepository = AppDataSource.getRepository(Post);

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author', 'category', 'relatedPosts'],
      order: { createdAt: 'DESC' },
    });
  }

  @Query(() => [Post])
  async publishedPosts(
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number
  ): Promise<Post[]> {
    return this.postRepository.find({
      where: { status: 'published' },
      relations: ['author', 'category'],
      order: { publishedAt: 'DESC' },
      skip: offset || 0,
      take: limit || undefined,
    });
  }

  @Query(() => Int)
  async countPublishedPosts(): Promise<number> {
    return this.postRepository.count({
      where: { status: 'published' },
    });
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'relatedPosts', 'relatedPosts.author', 'relatedPosts.category'],
    });
  }

  @Query(() => Post, { nullable: true })
  async postBySlug(@Arg('slug') slug: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'relatedPosts', 'relatedPosts.author', 'relatedPosts.category'],
    });
  }

  @Query(() => [Post])
  async postsByCategory(
    @Arg('categoryId') categoryId: string,
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number
  ): Promise<Post[]> {
    return this.postRepository.find({
      where: { categoryId, status: 'published' },
      relations: ['author', 'category'],
      order: { publishedAt: 'DESC' },
      skip: offset || 0,
      take: limit || undefined,
    });
  }

  @Query(() => [Post])
  async searchPosts(
    @Arg('term') term: string,
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number
  ): Promise<Post[]> {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .where('post.status = :status', { status: 'published' })
      .andWhere('(post.title ILIKE :term OR post.excerpt ILIKE :term OR post.content ILIKE :term)', 
        { term: `%${term}%` })
      .orderBy('post.publishedAt', 'DESC')
      .skip(offset || 0)
      .take(limit || 10)
      .getMany();
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { payload }: MyContext
  ): Promise<Post> {
    // Generar slug si no se proporciona
    if (!input.slug) {
      input.slug = slugify(input.title);
    }

    // Asignar el usuario autenticado como autor si no se especifica
    const authorId = input.authorId || payload.id;

    // Extraer los IDs de posts relacionados
    const { relatedPostIds, ...postData } = input;

    const post = this.postRepository.create({
      ...postData,
      authorId,
    });

    // Guardar el post primero
    const savedPost = await this.postRepository.save(post);

    // Si hay posts relacionados, cargarlos y establecer la relación
    if (relatedPostIds && relatedPostIds.length > 0) {
      const relatedPosts = await this.postRepository.find({
        where: { id: In(relatedPostIds) }
      });
      
      // Obtener el post guardado con todas sus relaciones
      const postToUpdate = await this.postRepository.findOne({
        where: { id: savedPost.id },
        relations: ['relatedPosts']
      });
      
      if (postToUpdate) {
        postToUpdate.relatedPosts = relatedPosts;
        await this.postRepository.save(postToUpdate);
      }
    }

    return this.postRepository.findOne({ 
      where: { id: savedPost.id },
      relations: ['author', 'category', 'relatedPosts']
    }) as Promise<Post>;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id') id: string,
    @Arg('input') input: PostUpdateInput,
    @Ctx() { payload }: MyContext
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'relatedPosts'],
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar si el usuario es el autor o un admin
    if (post.authorId !== payload.id && payload.role !== 'admin') {
      throw new Error('No tienes permiso para editar este post');
    }

    // Generar slug si se cambió el título y no se proporcionó un nuevo slug
    if (input.title && input.title !== post.title && !input.slug) {
      input.slug = slugify(input.title);
    }

    // Si se cambia el estado a 'published' y no tenía fecha de publicación, asignarla
    if (input.status === 'published' && post.status !== 'published') {
      input.publishedAt = new Date();
    }

    // Extraer los IDs de posts relacionados
    const { relatedPostIds, ...postData } = input;
    
    // Actualizar los datos básicos del post
    Object.assign(post, postData);
    
    // Si se proporcionaron posts relacionados, actualizar esa relación
    if (relatedPostIds !== undefined) {
      if (relatedPostIds.length > 0) {
        const relatedPosts = await this.postRepository.find({
          where: { id: In(relatedPostIds) }
        });
        post.relatedPosts = relatedPosts;
      } else {
        post.relatedPosts = [];
      }
    }

    await this.postRepository.save(post);
    
    return this.postRepository.findOne({ 
      where: { id: post.id },
      relations: ['author', 'category', 'relatedPosts']
    }) as Promise<Post>;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id') id: string,
    @Ctx() { payload }: MyContext
  ): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar si el usuario es el autor o un admin
    if (post.authorId !== payload.id && payload.role !== 'admin') {
      throw new Error('No tienes permiso para eliminar este post');
    }

    const result = await this.postRepository.delete(id);
    return result.affected !== 0;
  }
} 