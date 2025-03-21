import { Arg, Authorized, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root } from "type-graphql";
import { Video } from "../models/Video";
import { FindManyOptions, FindOptionsWhere, In, Like, Not, IsNull, Repository } from "typeorm";
import { VideoInput, VideoUpdateInput, VideoFilterInput, VideoSortInput } from "../schema/video.schema";
import { slugify } from "../utils/slugify";
import { AuthContext } from "../types/context";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Post } from "../models/Post";
import { AppDataSource } from "../database/data-source";
import { PaginatedVideos } from "../generatedTypes/video";

@Resolver(Video)
export class VideoResolver {
    private videoRepository: Repository<Video>;
    private postRepository: Repository<Post>;

    constructor() {
        this.videoRepository = AppDataSource.getRepository(Video);
        this.postRepository = AppDataSource.getRepository(Post);
    }

    // Queries
    @Query(() => [Video])
    async videos(): Promise<Video[]> {
        return this.videoRepository.find({
            relations: { author: true, category: true },
            order: { createdAt: "DESC" }
        });
    }

    @Query(() => PaginatedVideos)
    async paginatedVideos(
        @Arg("page", () => Int, { defaultValue: 1 }) page: number,
        @Arg("limit", () => Int, { defaultValue: 10 }) limit: number
    ): Promise<PaginatedVideos> {
        const [items, totalItems] = await this.videoRepository.findAndCount({
            relations: { category: true, author: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });

        const totalPages = Math.ceil(totalItems / limit);
        
        return {
            items,
            meta: {
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                totalItems,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    @Query(() => [Video])
    async featuredVideos(): Promise<Video[]> {
        return this.videoRepository.find({
            where: { featured: true },
            relations: { category: true, author: true },
            take: 5
        });
    }

    @Query(() => Video, { nullable: true })
    async video(@Arg("id") id: string): Promise<Video | null> {
        return this.videoRepository.findOne({
            where: { id },
            relations: { category: true, author: true, posts: true }
        });
    }

    @Query(() => Video, { nullable: true })
    async videoBySlug(@Arg("slug") slug: string): Promise<Video | null> {
        return this.videoRepository.findOne({
            where: { slug },
            relations: { category: true, author: true, posts: true }
        });
    }

    @Query(() => PaginatedVideos)
    async videosByCategory(
        @Arg("categoryId") categoryId: string,
        @Arg("page", () => Int, { defaultValue: 1 }) page: number,
        @Arg("limit", () => Int, { defaultValue: 10 }) limit: number
    ): Promise<PaginatedVideos> {
        const [items, totalItems] = await this.videoRepository.findAndCount({
            where: { categoryId },
            relations: { category: true, author: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });

        const totalPages = Math.ceil(totalItems / limit);
        
        return {
            items,
            meta: {
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                totalItems,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    @Query(() => PaginatedVideos)
    async videosByPost(
        @Arg("postId") postId: string,
        @Arg("page", () => Int, { defaultValue: 1 }) page: number,
        @Arg("perPage", () => Int, { defaultValue: 10 }) perPage: number
    ): Promise<PaginatedVideos> {
        // Buscar el post para verificar que existe
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: { videos: true }
        });

        if (!post) {
            throw new Error("Post no encontrado");
        }

        const total = post.videos?.length || 0;
        const start = (page - 1) * perPage;
        const end = Math.min(start + perPage, total);
        
        const items = post.videos?.slice(start, end) || [];
        
        return {
            items,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(total / perPage),
                itemsPerPage: perPage,
                totalItems: total,
                hasNextPage: end < total,
                hasPreviousPage: page > 1
            }
        };
    }

    // Mutations
    @Mutation(() => Video)
    @Authorized(["ADMIN", "EDITOR"])
    async createVideo(
        @Arg("title") title: string,
        @Arg("videoUrl") videoUrl: string,
        @Arg("thumbnailUrl") thumbnailUrl: string,
        @Arg("provider") provider: string,
        @Arg("videoId") videoId: string,
        @Arg("categoryId") categoryId: string,
        @Ctx() ctx: AuthContext,
        @Arg("description", { nullable: true }) description?: string,
        @Arg("duration", { nullable: true }) duration?: number,
        @Arg("transcription", { nullable: true }) transcription?: string,
        @Arg("featured", { defaultValue: false }) featured: boolean = false,
        @Arg("postIds", () => [String], { nullable: true }) postIds?: string[]
    ): Promise<Video> {
        const { user } = ctx;
        if (!user) {
            throw new Error("Unauthenticated");
        }

        // Create slug from title
        const slug = slugify(title);

        // Crear el video
        const video = new Video();
        video.title = title;
        video.slug = slug;
        video.description = description || '';
        video.videoUrl = videoUrl;
        video.thumbnailUrl = thumbnailUrl;
        video.provider = provider;
        video.videoId = videoId;
        video.duration = duration || 0;
        video.transcription = transcription || '';
        video.featured = featured;
        video.categoryId = categoryId;
        video.authorId = user.id;

        // Save video
        await this.videoRepository.save(video);

        // Associate with posts if provided
        if (postIds && postIds.length > 0) {
            const posts = await this.postRepository.findBy({ id: In(postIds) });
            if (posts.length > 0) {
                video.posts = posts;
                await this.videoRepository.save(video);
            }
        }

        return video;
    }

    @Mutation(() => Video)
    @Authorized(["ADMIN", "EDITOR"])
    async updateVideo(
        @Arg("id") id: string,
        @Ctx() ctx: AuthContext,
        @Arg("title", { nullable: true }) title?: string,
        @Arg("description", { nullable: true }) description?: string,
        @Arg("videoUrl", { nullable: true }) videoUrl?: string,
        @Arg("thumbnailUrl", { nullable: true }) thumbnailUrl?: string,
        @Arg("provider", { nullable: true }) provider?: string,
        @Arg("videoId", { nullable: true }) videoId?: string,
        @Arg("duration", { nullable: true }) duration?: number,
        @Arg("transcription", { nullable: true }) transcription?: string,
        @Arg("featured", { nullable: true }) featured?: boolean,
        @Arg("categoryId", { nullable: true }) categoryId?: string,
        @Arg("postIds", () => [String], { nullable: true }) postIds?: string[]
    ): Promise<Video> {
        const { user } = ctx;
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const video = await this.videoRepository.findOne({
            where: { id },
            relations: { posts: true }
        });

        if (!video) {
            throw new Error("Video not found");
        }

        if (video.authorId !== user.id && user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        // Update fields if provided
        if (title) {
            video.title = title;
            video.slug = slugify(title);
        }

        if (description !== undefined) video.description = description;
        if (videoUrl) video.videoUrl = videoUrl;
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
        if (provider) video.provider = provider;
        if (videoId) video.videoId = videoId;
        if (duration !== undefined) video.duration = duration;
        if (transcription !== undefined) video.transcription = transcription;
        if (featured !== undefined) video.featured = featured;
        if (categoryId) video.categoryId = categoryId;

        // Update associated posts if provided
        if (postIds !== undefined) {
            if (postIds.length > 0) {
                const posts = await this.postRepository.findBy({ id: In(postIds) });
                video.posts = posts;
            } else {
                video.posts = [];
            }
        }

        // Save video
        return this.videoRepository.save(video);
    }

    @Mutation(() => Boolean)
    @Authorized(["ADMIN", "EDITOR"])
    async deleteVideo(
        @Arg("id") id: string,
        @Ctx() ctx: AuthContext
    ): Promise<boolean> {
        const { user } = ctx;
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const video = await this.videoRepository.findOne({
            where: { id }
        });

        if (!video) {
            throw new Error("Video not found");
        }

        if (video.authorId !== user.id && user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        await this.videoRepository.remove(video);

        return true;
    }

    @Mutation(() => Video)
    @Authorized(["ADMIN", "EDITOR"])
    async addPostToVideo(
        @Arg("videoId") videoId: string,
        @Arg("postId") postId: string,
        @Ctx() { user }: AuthContext
    ): Promise<Video> {
        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        const video = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: { posts: true }
        });

        if (!video) {
            throw new Error("Video no encontrado");
        }

        // Verificar permisos
        if (user.role !== "ADMIN" && video.authorId !== user.id) {
            throw new Error("No tienes permiso para modificar este video");
        }

        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new Error("Post no encontrado");
        }

        // Evitar duplicados
        if (!video.posts) {
            video.posts = [];
        }
        
        const alreadyLinked = video.posts.some(p => p.id === postId);
        if (!alreadyLinked) {
            video.posts.push(post);
            await this.videoRepository.save(video);
        }

        return video;
    }

    @Mutation(() => Video)
    @Authorized(["ADMIN", "EDITOR"])
    async removePostFromVideo(
        @Arg("videoId") videoId: string,
        @Arg("postId") postId: string,
        @Ctx() { user }: AuthContext
    ): Promise<Video> {
        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        const video = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: { posts: true }
        });

        if (!video) {
            throw new Error("Video no encontrado");
        }

        // Verificar permisos
        if (user.role !== "ADMIN" && video.authorId !== user.id) {
            throw new Error("No tienes permiso para modificar este video");
        }

        if (video.posts) {
            video.posts = video.posts.filter(p => p.id !== postId);
            await this.videoRepository.save(video);
        }

        return video;
    }
} 