import { Resolver, Query, Mutation, Arg, Ctx, FieldResolver, Root, Authorized } from 'type-graphql';
import { Tag } from '../models/Tag';
import { Post } from '../models/Post';
import { Video } from '../models/Video';
import { TagInput, TagUpdateInput, TagFilterInput } from '../schema/tag.schema';
import { AuthContext } from '../types/context';
import { slugify } from '../utils/slugify';
import { PaginationInput } from '../schema/common.schema';
import { PaginatedResponse, PaginatedTagResponse } from '../types/pagination';
import { AppDataSource } from '../database/data-source';

// Crear un tipo paginado para los Tags
const PaginatedTags = PaginatedResponse(Tag);
type PaginatedTagsType = InstanceType<typeof PaginatedTags>;

@Resolver(() => Tag)
export class TagResolver {
  private tagRepository = AppDataSource.getRepository(Tag);
  private postRepository = AppDataSource.getRepository(Post);
  private videoRepository = AppDataSource.getRepository(Video);

  @Query(() => [Tag])
  async tags(
    @Arg('filter', { nullable: true }) filter?: TagFilterInput,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<Tag[]> {
    const offset = pagination?.offset || 0;
    const limit = pagination?.limit || 10;

    let query = this.tagRepository.createQueryBuilder('tag');

    if (filter) {
      if (filter.name) {
        query = query.andWhere('tag.name LIKE :name', { name: `%${filter.name}%` });
      }
      
      if (filter.description) {
        query = query.andWhere('tag.description LIKE :description', { description: `%${filter.description}%` });
      }
      
      if (filter.isActive !== undefined) {
        query = query.andWhere('tag.isActive = :isActive', { isActive: filter.isActive });
      }
    }

    return query
      .orderBy('tag.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  @Query(() => PaginatedTagResponse)
  async paginatedTags(
    @Arg('filter', { nullable: true }) filter?: TagFilterInput,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<PaginatedResponse<Tag>> {
    const offset = pagination?.offset || 0;
    const limit = pagination?.limit || 10;
    const page = Math.floor(offset / limit) + 1;

    let query = this.tagRepository.createQueryBuilder('tag');

    if (filter) {
      if (filter.name) {
        query = query.andWhere('tag.name LIKE :name', { name: `%${filter.name}%` });
      }
      
      if (filter.description) {
        query = query.andWhere('tag.description LIKE :description', { description: `%${filter.description}%` });
      }
      
      if (filter.isActive !== undefined) {
        query = query.andWhere('tag.isActive = :isActive', { isActive: filter.isActive });
      }
    }

    const [items, total] = await Promise.all([
      query
        .orderBy('tag.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany(),
      query.getCount()
    ]);

    return {
      items,
      total,
      hasMore: total > offset + limit,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  @Query(() => Tag, { nullable: true })
  async tag(@Arg('id') id: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { id } });
  }

  @Authorized('ADMIN')
  @Mutation(() => Tag)
  async createTag(
    @Arg('input') input: TagInput,
    @Ctx() { user }: AuthContext
  ): Promise<Tag> {
    const tag = this.tagRepository.create(input);
    
    // Generate slug if not provided
    if (!tag.slug) {
      tag.slug = slugify(tag.name);
    }
    
    return this.tagRepository.save(tag);
  }

  @Authorized('ADMIN')
  @Mutation(() => Tag, { nullable: true })
  async updateTag(
    @Arg('id') id: string,
    @Arg('input') input: TagUpdateInput,
    @Ctx() { user }: AuthContext
  ): Promise<Tag | null> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    
    if (!tag) {
      return null;
    }
    
    // Generate slug if name is updated but slug is not provided
    if (input.name && !input.slug) {
      input.slug = slugify(input.name);
    }
    
    Object.assign(tag, input);
    
    return this.tagRepository.save(tag);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean)
  async deleteTag(
    @Arg('id') id: string,
    @Ctx() { user }: AuthContext
  ): Promise<boolean> {
    const result = await this.tagRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  @FieldResolver()
  async posts(@Root() tag: Tag): Promise<Post[]> {
    const tagWithPosts = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.posts', 'post')
      .where('tag.id = :id', { id: tag.id })
      .getOne();
      
    return tagWithPosts?.posts || [];
  }

  @FieldResolver()
  async videos(@Root() tag: Tag): Promise<Video[]> {
    const tagWithVideos = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.videos', 'video')
      .where('tag.id = :id', { id: tag.id })
      .getOne();
      
    return tagWithVideos?.videos || [];
  }

  // Obtener tag por slug
  @Query(() => Tag, { nullable: true })
  async tagBySlug(@Arg('slug') slug: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { slug } });
  }

  // Asignar tag a un post
  @Mutation(() => Post)
  @Authorized(['ADMIN'])
  async addTagToPost(
    @Arg('postId') postId: string,
    @Arg('tagId') tagId: string,
    @Ctx() { user }: AuthContext
  ): Promise<Post> {
    // Encontrar el post y el tag
    const post = await this.postRepository.findOne({ 
      where: { id: postId },
      relations: ['tags']
    });
    
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    
    if (!post) throw new Error('Post no encontrado');
    if (!tag) throw new Error('Tag no encontrado');
    
    // Verificar si el tag ya está asignado
    if (!post.tags) {
      post.tags = [];
    }
    
    if (!post.tags.some(t => t.id === tag.id)) {
      post.tags.push(tag);
      await this.postRepository.save(post);
    }
    
    return post;
  }

  // Quitar tag de un post
  @Mutation(() => Post)
  @Authorized(['ADMIN'])
  async removeTagFromPost(
    @Arg('postId') postId: string,
    @Arg('tagId') tagId: string,
    @Ctx() { user }: AuthContext
  ): Promise<Post> {
    // Encontrar el post
    const post = await this.postRepository.findOne({ 
      where: { id: postId },
      relations: ['tags']
    });
    
    if (!post) throw new Error('Post no encontrado');
    if (!post.tags) return post;
    
    // Filtrar el tag
    post.tags = post.tags.filter(tag => tag.id !== tagId);
    await this.postRepository.save(post);
    
    return post;
  }

  // Asignar tag a un video
  @Mutation(() => Video)
  @Authorized(['ADMIN'])
  async addTagToVideo(
    @Arg('videoId') videoId: string,
    @Arg('tagId') tagId: string,
    @Ctx() { user }: AuthContext
  ): Promise<Video> {
    // Encontrar el video y el tag
    const video = await this.videoRepository.findOne({ 
      where: { id: videoId },
      relations: ['tags']
    });
    
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    
    if (!video) throw new Error('Video no encontrado');
    if (!tag) throw new Error('Tag no encontrado');
    
    // Verificar si el tag ya está asignado
    if (!video.tags) {
      video.tags = [];
    }
    
    if (!video.tags.some(t => t.id === tag.id)) {
      video.tags.push(tag);
      await this.videoRepository.save(video);
    }
    
    return video;
  }

  // Quitar tag de un video
  @Mutation(() => Video)
  @Authorized(['ADMIN'])
  async removeTagFromVideo(
    @Arg('videoId') videoId: string,
    @Arg('tagId') tagId: string,
    @Ctx() { user }: AuthContext
  ): Promise<Video> {
    // Encontrar el video
    const video = await this.videoRepository.findOne({ 
      where: { id: videoId },
      relations: ['tags']
    });
    
    if (!video) throw new Error('Video no encontrado');
    if (!video.tags) return video;
    
    // Filtrar el tag
    video.tags = video.tags.filter(tag => tag.id !== tagId);
    await this.videoRepository.save(video);
    
    return video;
  }

  // Búsqueda de tags por término
  @Query(() => [Tag])
  async searchTags(@Arg('term') term: string): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :term', { term: `%${term}%` })
      .orWhere('tag.description ILIKE :term', { term: `%${term}%` })
      .orderBy('tag.name', 'ASC')
      .getMany();
  }
} 