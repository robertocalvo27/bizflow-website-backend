import { InputType, Field } from 'type-graphql';
import { Length, MaxLength, MinLength, IsOptional, IsUUID, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

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

  @Field({ nullable: true })
  @IsOptional()
  status?: string = 'draft';

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

  @Field({ nullable: true })
  @IsOptional()
  status?: string;

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