import { Resolver, Query, Arg } from 'type-graphql';
import { ILike, In, Between, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Post } from '../models/Post';
import { Video } from '../models/Video';
import { SearchInput, RelatedContentInput, ContentType } from '../schema/search.schema';
import { SearchResult, SearchResults, RelatedContent } from '../types/search';
import { PaginationInput } from '../schema/common.schema';

@Resolver()
export class SearchResolver {
  private postRepository = AppDataSource.getRepository(Post);
  private videoRepository = AppDataSource.getRepository(Video);

  @Query(() => SearchResults)
  async search(
    @Arg('input') input: SearchInput,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<SearchResults> {
    const offset = pagination?.offset || 0;
    const limit = pagination?.limit || 10;
    const page = Math.floor(offset / limit) + 1;

    const baseWhere: FindOptionsWhere<Post | Video> = {};

    // Aplicar filtros comunes
    if (input.query) {
      baseWhere.title = ILike(`%${input.query}%`);
    }

    if (input.categories?.length) {
      baseWhere.category = { id: In(input.categories) };
    }

    if (input.tags?.length) {
      baseWhere.tags = { id: In(input.tags) };
    }

    if (input.fromDate || input.toDate) {
      baseWhere.createdAt = Between(
        input.fromDate || new Date(0),
        input.toDate || new Date()
      );
    }

    // Búsqueda en posts
    let posts: Post[] = [];
    let postsCount = 0;
    if (input.type === ContentType.ALL || input.type === ContentType.POST) {
      [posts, postsCount] = await this.postRepository.findAndCount({
        where: baseWhere,
        relations: ['category', 'tags'],
        skip: offset,
        take: limit,
        order: {
          [input.sortBy || 'createdAt']: input.sortOrder || 'DESC'
        }
      });
    }

    // Búsqueda en videos
    let videos: Video[] = [];
    let videosCount = 0;
    if (input.type === ContentType.ALL || input.type === ContentType.VIDEO) {
      [videos, videosCount] = await this.videoRepository.findAndCount({
        where: baseWhere,
        relations: ['category', 'tags'],
        skip: offset,
        take: limit,
        order: {
          [input.sortBy || 'createdAt']: input.sortOrder || 'DESC'
        }
      });
    }

    // Combinar y ordenar resultados
    const items: SearchResult[] = [
      ...posts.map(post => ({
        post,
        type: 'POST',
        createdAt: post.createdAt,
        relevanceScore: this.calculateRelevanceScore(post, input.query)
      })),
      ...videos.map(video => ({
        video,
        type: 'VIDEO',
        createdAt: video.createdAt,
        relevanceScore: this.calculateRelevanceScore(video, input.query)
      }))
    ].sort((a, b) => {
      if (input.sortBy === 'relevanceScore') {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const total = postsCount + videosCount;
    const pages = Math.ceil(total / limit);

    return {
      items: items.slice(0, limit),
      total,
      page,
      pages,
      hasMore: total > offset + limit
    };
  }

  @Query(() => RelatedContent)
  async getRelatedContent(
    @Arg('input') input: RelatedContentInput
  ): Promise<RelatedContent> {
    const limit = input.limit || 5;
    let items: SearchResult[] = [];
    let total = 0;

    if (input.type === ContentType.POST) {
      const post = await this.postRepository.findOne({
        where: { id: input.contentId },
        relations: ['category', 'tags']
      });

      if (post) {
        const [relatedPosts, count] = await this.postRepository.findAndCount({
          where: [
            { category: { id: post.category.id } },
            { tags: { id: In(post.tags.map(tag => tag.id)) } }
          ],
          relations: ['category', 'tags'],
          take: limit
        });

        items = relatedPosts
          .filter(p => p.id !== post.id && (!input.excludeIds?.includes(p.id)))
          .map(p => ({
            post: p,
            type: 'POST',
            createdAt: p.createdAt,
            relevanceScore: this.calculateRelatedScore(p, post)
          }));
        total = count;
      }
    } else if (input.type === ContentType.VIDEO) {
      const video = await this.videoRepository.findOne({
        where: { id: input.contentId },
        relations: ['category', 'tags']
      });

      if (video) {
        const [relatedVideos, count] = await this.videoRepository.findAndCount({
          where: [
            { category: { id: video.category.id } },
            { tags: { id: In(video.tags.map(tag => tag.id)) } }
          ],
          relations: ['category', 'tags'],
          take: limit
        });

        items = relatedVideos
          .filter(v => v.id !== video.id && (!input.excludeIds?.includes(v.id)))
          .map(v => ({
            video: v,
            type: 'VIDEO',
            createdAt: v.createdAt,
            relevanceScore: this.calculateRelatedScore(v, video)
          }));
        total = count;
      }
    }

    // Ordenar por relevancia
    items.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      items: items.slice(0, limit),
      total
    };
  }

  private calculateRelevanceScore(content: Post | Video, query?: string): number {
    if (!query) return 1;

    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Puntuación por título
    if (content.title.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    // Puntuación por contenido/descripción
    if ('description' in content && content.description?.toLowerCase().includes(lowerQuery)) {
      score += 3;
    } else if ('excerpt' in content && content.excerpt?.toLowerCase().includes(lowerQuery)) {
      score += 3;
    } else if ('content' in content && content.content?.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }

    // Puntuación por tags
    if (content.tags?.some(tag => 
      tag.name.toLowerCase().includes(lowerQuery) || 
      tag.description?.toLowerCase().includes(lowerQuery)
    )) {
      score += 2;
    }

    // Puntuación por categoría
    if (content.category?.name.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }

    // Factor de tiempo (contenido más reciente tiene mayor puntuación)
    const ageInDays = (Date.now() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeFactor = Math.max(0, 1 - (ageInDays / 365)); // Decrece linealmente durante un año
    
    return score * (1 + timeFactor);
  }

  private calculateRelatedScore(content: Post | Video, reference: Post | Video): number {
    let score = 0;

    // Puntuación por categoría compartida
    if (content.category?.id === reference.category?.id) {
      score += 5;
    }

    // Puntuación por tags compartidos
    const contentTagIds = new Set(content.tags?.map(tag => tag.id));
    const referenceTagIds = new Set(reference.tags?.map(tag => tag.id));
    const sharedTags = [...contentTagIds].filter(id => referenceTagIds.has(id));
    score += sharedTags.length * 2;

    // Factor de tiempo
    const ageInDays = (Date.now() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeFactor = Math.max(0, 1 - (ageInDays / 365));

    return score * (1 + timeFactor);
  }
} 