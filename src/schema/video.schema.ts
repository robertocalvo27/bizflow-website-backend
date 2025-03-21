import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { Length, IsOptional, IsUUID, IsBoolean, IsUrl, IsInt, Min, IsEnum } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { Video, VideoProvider } from '../models/Video';
import { PaginationInput, SortInput, PageInfo, TextFilterInput } from './common.schema';

// Registrar el enum para GraphQL
registerEnumType(VideoProvider, {
  name: 'VideoProvider',
  description: 'Proveedores de video soportados',
});

// Enum para los campos por los que se puede ordenar
export enum VideoSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DURATION = 'duration'
}

// Registrar el enum para GraphQL
registerEnumType(VideoSortField, {
  name: 'VideoSortField',
  description: 'Campos por los que se pueden ordenar los videos',
});

@InputType()
export class VideoInput {
  @Field()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres' })
  description?: string;

  @Field()
  @IsUrl({}, { message: 'La URL del video debe ser una URL válida' })
  videoUrl: string;

  @Field()
  @IsUrl({}, { message: 'La URL de la miniatura debe ser una URL válida' })
  thumbnailUrl: string;

  @Field(() => VideoProvider)
  @IsEnum(VideoProvider, { message: 'Proveedor de video inválido' })
  provider: VideoProvider;

  @Field()
  videoId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La duración debe ser un número positivo' })
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  transcription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  @Field()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId: string;

  @Field()
  @IsUUID('4', { message: 'ID de autor inválido' })
  authorId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true, message: 'ID de post inválido' })
  relatedPostIds?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class VideoUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del video debe ser una URL válida' })
  videoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la miniatura debe ser una URL válida' })
  thumbnailUrl?: string;

  @Field(() => VideoProvider, { nullable: true })
  @IsOptional()
  @IsEnum(VideoProvider, { message: 'Proveedor de video inválido' })
  provider?: VideoProvider;

  @Field({ nullable: true })
  @IsOptional()
  videoId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La duración debe ser un número positivo' })
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  transcription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de autor inválido' })
  authorId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true, message: 'ID de post inválido' })
  relatedPostIds?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class VideoFilterInput {
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  title?: TextFilterInput;

  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  description?: TextFilterInput;

  @Field(() => [VideoProvider], { nullable: true })
  @IsOptional()
  providers?: VideoProvider[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  authorIds?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  featured?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasTranscription?: boolean;
}

@InputType()
export class VideoSortInput extends SortInput {
  @Field(() => VideoSortField)
  @IsOptional()
  field: VideoSortField = VideoSortField.CREATED_AT;
}

@ObjectType()
export class PaginatedVideos {
  @Field(() => [Video])
  items: Video[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
} 