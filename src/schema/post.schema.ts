import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { Length, MaxLength, MinLength, IsOptional, IsUUID, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { Post } from '../models/Post';
import { PaginationInput, SortInput, PageInfo, DateFilterInput, TextFilterInput } from './common.schema';

// Enum para los campos por los que se puede ordenar
export enum PostSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PUBLISHED_AT = 'publishedAt'
}

// Registrar el enum para GraphQL
registerEnumType(PostSortField, {
  name: 'PostSortField',
  description: 'Campos por los que se pueden ordenar los posts',
});

// Enum para los estados de post
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Registrar el enum para GraphQL
registerEnumType(PostStatus, {
  name: 'PostStatus',
  description: 'Estados posibles de un post',
});

@InputType()
export class PostInput {
  @Field()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  @Length(10, 500, { message: 'El extracto debe tener entre 10 y 500 caracteres' })
  excerpt: string;

  @Field()
  @MinLength(20, { message: 'El contenido debe tener al menos 20 caracteres' })
  content: string;

  @Field(() => PostStatus, { nullable: true })
  @IsOptional()
  status?: PostStatus = PostStatus.DRAFT;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de autor inválido' })
  authorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  featuredImageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  relatedPostIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(160, { message: 'El meta título debe tener menos de 160 caracteres' })
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500, { message: 'La meta descripción debe tener menos de 500 caracteres' })
  metaDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  metaKeywords?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  indexable?: boolean = true;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL canónica debe ser una URL válida' })
  canonicalUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  structuredData?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen social debe ser una URL válida' })
  socialImageUrl?: string;
}

@InputType()
export class PostUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(10, 500, { message: 'El extracto debe tener entre 10 y 500 caracteres' })
  excerpt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(20, { message: 'El contenido debe tener al menos 20 caracteres' })
  content?: string;

  @Field(() => PostStatus, { nullable: true })
  @IsOptional()
  status?: PostStatus;

  @Field({ nullable: true })
  @IsOptional()
  publishedAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  featuredImageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  relatedPostIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(160, { message: 'El meta título debe tener menos de 160 caracteres' })
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500, { message: 'La meta descripción debe tener menos de 500 caracteres' })
  metaDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  metaKeywords?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  indexable?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL canónica debe ser una URL válida' })
  canonicalUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  structuredData?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen social debe ser una URL válida' })
  socialImageUrl?: string;
}

@InputType()
export class PostFilterInput {
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  title?: TextFilterInput;

  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  content?: TextFilterInput;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  authorIds?: string[];

  @Field(() => PostStatus, { nullable: true })
  @IsOptional()
  status?: PostStatus;

  @Field(() => DateFilterInput, { nullable: true })
  @IsOptional()
  publishedAt?: DateFilterInput;

  @Field(() => DateFilterInput, { nullable: true })
  @IsOptional()
  createdAt?: DateFilterInput;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  featured?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  indexable?: boolean;
}

@InputType()
export class PostSortInput extends SortInput {
  @Field(() => PostSortField)
  @IsOptional()
  field: PostSortField = PostSortField.PUBLISHED_AT;
}

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
} 