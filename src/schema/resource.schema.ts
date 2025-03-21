import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { Length, IsOptional, IsUUID, IsBoolean, IsUrl, IsNumber, Min, IsEnum } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { Resource, ResourceType } from '../models/Resource';
import { PaginationInput, SortInput, PageInfo, TextFilterInput } from './common.schema';

// Registrar el enum para GraphQL
registerEnumType(ResourceType, {
  name: 'ResourceType',
  description: 'Tipos de recursos disponibles',
});

// Enum para los campos por los que se puede ordenar
export enum ResourceSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DOWNLOAD_COUNT = 'downloadCount',
  FILE_SIZE = 'fileSize'
}

// Registrar el enum para GraphQL
registerEnumType(ResourceSortField, {
  name: 'ResourceSortField',
  description: 'Campos por los que se pueden ordenar los recursos',
});

@InputType()
export class ResourceInput {
  @Field()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
  description: string;

  @Field()
  @IsUrl({}, { message: 'La URL del archivo debe ser una URL válida' })
  fileUrl: string;

  @Field(() => ResourceType)
  @IsEnum(ResourceType, { message: 'Tipo de recurso inválido' })
  resourceType: ResourceType;

  @Field()
  @IsNumber()
  @Min(0, { message: 'El tamaño del archivo debe ser un número positivo' })
  fileSize: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la miniatura debe ser una URL válida' })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  downloadInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @Field()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de uploader inválido' })
  uploaderId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class ResourceUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(3, 200, { message: 'El título debe tener entre 3 y 200 caracteres' })
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del archivo debe ser una URL válida' })
  fileUrl?: string;

  @Field(() => ResourceType, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceType, { message: 'Tipo de recurso inválido' })
  resourceType?: ResourceType;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El tamaño del archivo debe ser un número positivo' })
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la miniatura debe ser una URL válida' })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  downloadInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de categoría inválido' })
  categoryId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class ResourceFilterInput {
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  title?: TextFilterInput;

  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  description?: TextFilterInput;

  @Field(() => [ResourceType], { nullable: true })
  @IsOptional()
  resourceTypes?: ResourceType[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  uploaderIds?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  featured?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isPublic?: boolean;
}

@InputType()
export class ResourceSortInput extends SortInput {
  @Field(() => ResourceSortField)
  @IsOptional()
  field: ResourceSortField = ResourceSortField.CREATED_AT;
}

@ObjectType()
export class PaginatedResources {
  @Field(() => [Resource])
  items: Resource[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
} 