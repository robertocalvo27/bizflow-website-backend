import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, Int } from 'type-graphql';
import { Post } from '../models/Post';
import { 
  PostInput, 
  PostUpdateInput, 
  PaginatedPosts, 
  PostFilterInput,
  PostSortInput,
  PostStatus
} from '../schema/post.schema';
import { PaginationInput, SortOrder } from '../schema/common.schema';
import { AppDataSource } from '../database/data-source';
import { isAuth } from '../middleware/auth';
import { MyContext } from '../middleware/auth';
import { slugify } from '../utils/slugify';
import { In, Like, Between, IsNull, Not, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { CTA } from '../models/CTA';

// Función para calcular el tiempo de lectura basado en el contenido
function calculateReadingTime(content: string): number {
  // Promedio de palabras leídas por minuto
  const wordsPerMinute = 225;
  // Contar palabras en el contenido (aproximado)
  const wordCount = content.trim().split(/\s+/).length;
  // Calcular tiempo en minutos
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  // Devolver al menos 1 minuto
  return Math.max(1, readingTime);
}

@Resolver()
export class PostResolver {
  private postRepository = AppDataSource.getRepository(Post);

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author', 'category', 'relatedPosts'],
      order: { createdAt: SortOrder.DESC },
    });
  }

  @Query(() => PaginatedPosts)
  async paginatedPosts(
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: PostFilterInput,
    @Arg('sort', { nullable: true }) sort?: PostSortInput
  ): Promise<PaginatedPosts> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'publishedAt';
    const sortOrder = sort?.order || SortOrder.DESC;
    
    // Construir el objeto de condiciones where
    const where: FindOptionsWhere<Post> = {};
    
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
      
      // Filtrar por contenido
      if (filter.content?.contains) {
        where.content = Like(`%${filter.content.contains}%`);
      }
      
      // Filtrar por categorías
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = In(filter.categoryIds);
      }
      
      // Filtrar por autores
      if (filter.authorIds && filter.authorIds.length > 0) {
        where.authorId = In(filter.authorIds);
      }
      
      // Filtrar por estado
      if (filter.status) {
        where.status = filter.status;
      }
      
      // Filtrar por fecha de publicación
      if (filter.publishedAt) {
        if (filter.publishedAt.from && filter.publishedAt.to) {
          where.publishedAt = Between(filter.publishedAt.from, filter.publishedAt.to);
        } else if (filter.publishedAt.from) {
          where.publishedAt = Between(filter.publishedAt.from, new Date());
        }
      }
      
      // Filtrar por fecha de creación
      if (filter.createdAt) {
        if (filter.createdAt.from && filter.createdAt.to) {
          where.createdAt = Between(filter.createdAt.from, filter.createdAt.to);
        } else if (filter.createdAt.from) {
          where.createdAt = Between(filter.createdAt.from, new Date());
        }
      }
      
      // Filtrar por indexable
      if (filter.indexable !== undefined) {
        where.indexable = filter.indexable;
      }
    }
    
    // Construir el objeto de ordenamiento
    const order: FindOptionsOrder<Post> = {
      [sortField]: sortOrder,
    };
    
    // Contar el total de items que coinciden con el filtro
    const totalItems = await this.postRepository.count({ where });
    
    // Calcular info de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    // Obtener los items para la página actual
    const items = await this.postRepository.find({
      where,
      order,
      skip: offset,
      take: limit,
      relations: ['author', 'category', 'relatedPosts'],
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

  @Query(() => [Post])
  async publishedPosts(
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('sort', { nullable: true }) sort?: PostSortInput
  ): Promise<Post[]> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'publishedAt';
    const sortOrder = sort?.order || SortOrder.DESC;
    
    const order: FindOptionsOrder<Post> = {
      [sortField]: sortOrder,
    };
    
    return this.postRepository.find({
      where: { status: PostStatus.PUBLISHED },
      relations: ['author', 'category'],
      order,
      skip: offset,
      take: limit,
    });
  }

  @Query(() => Int)
  async countPublishedPosts(): Promise<number> {
    return this.postRepository.count({
      where: { status: PostStatus.PUBLISHED },
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

  @Query(() => PaginatedPosts)
  async postsByCategory(
    @Arg('categoryId') categoryId: string,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('sort', { nullable: true }) sort?: PostSortInput
  ): Promise<PaginatedPosts> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'publishedAt';
    const sortOrder = sort?.order || SortOrder.DESC;
    
    const order: FindOptionsOrder<Post> = {
      [sortField]: sortOrder,
    };
    
    // Contar el total de items
    const totalItems = await this.postRepository.count({
      where: { categoryId, status: PostStatus.PUBLISHED },
    });
    
    // Calcular info de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    // Obtener los items para la página actual
    const items = await this.postRepository.find({
      where: { categoryId, status: PostStatus.PUBLISHED },
      relations: ['author', 'category'],
      order,
      skip: offset,
      take: limit,
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

  @Query(() => PaginatedPosts)
  async searchPosts(
    @Arg('term') term: string,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: PostFilterInput,
    @Arg('sort', { nullable: true }) sort?: PostSortInput
  ): Promise<PaginatedPosts> {
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'publishedAt';
    const sortOrder = sort?.order || SortOrder.DESC;
    
    // Iniciar un query builder
    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('(post.title ILIKE :term OR post.excerpt ILIKE :term OR post.content ILIKE :term OR post.metaKeywords ILIKE :term)', 
        { term: `%${term}%` });
    
    // Aplicar filtros adicionales si están presentes
    if (filter) {
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        queryBuilder.andWhere('post.categoryId IN (:...categoryIds)', { categoryIds: filter.categoryIds });
      }
      
      if (filter.authorIds && filter.authorIds.length > 0) {
        queryBuilder.andWhere('post.authorId IN (:...authorIds)', { authorIds: filter.authorIds });
      }
      
      if (filter.indexable !== undefined) {
        queryBuilder.andWhere('post.indexable = :indexable', { indexable: filter.indexable });
      }
    }
    
    // Ordenar resultados
    queryBuilder.orderBy(`post.${sortField}`, sortOrder);
    
    // Contar el total de resultados
    const totalItems = await queryBuilder.getCount();
    
    // Aplicar paginación
    queryBuilder.skip(offset).take(limit);
    
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

    // Calcular tiempo de lectura si no se proporciona
    if (!input.readingTime && input.content) {
      input.readingTime = calculateReadingTime(input.content);
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
    if (input.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
      input.publishedAt = new Date();
    }

    // Calcular tiempo de lectura si se actualizó el contenido y no se proporcionó un nuevo tiempo de lectura
    if (input.content && !input.readingTime) {
      input.readingTime = calculateReadingTime(input.content);
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

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async assignCTAToPost(
    @Arg('postId') postId: string,
    @Arg('ctaId') ctaId: string,
    @Ctx() { payload }: MyContext
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ 
      where: { id: postId },
      relations: ['author']
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar que el usuario sea el autor o un administrador
    if (payload.role !== 'admin' && post.authorId !== payload.userId) {
      throw new Error('No tienes permiso para editar este post');
    }

    // Verificar que el CTA exista
    const ctaRepository = AppDataSource.getRepository(CTA);
    const cta = await ctaRepository.findOne({ where: { id: ctaId } });

    if (!cta) {
      throw new Error('CTA no encontrado');
    }

    // Asignar el CTA al post
    post.ctaId = ctaId;
    post.cta = cta;

    await this.postRepository.save(post);
    
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async removeCTAFromPost(
    @Arg('postId') postId: string,
    @Ctx() { payload }: MyContext
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ 
      where: { id: postId },
      relations: ['author'] 
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar que el usuario sea el autor o un administrador
    if (payload.role !== 'admin' && post.authorId !== payload.userId) {
      throw new Error('No tienes permiso para editar este post');
    }

    // Usar un raw query para evitar problemas de tipado
    await this.postRepository.query(
      `UPDATE posts SET "ctaId" = NULL WHERE id = $1`, 
      [postId]
    );

    // Recargar el post actualizado para asegurarnos de tener datos frescos
    const updatedPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author']
    });

    return updatedPost!;
  }
} 