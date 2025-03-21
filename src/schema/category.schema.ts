import { InputType, Field } from 'type-graphql';
import { Length, MaxLength, IsOptional, IsBoolean, IsUrl } from 'class-validator';

@InputType()
export class CategoryInput {
  @Field()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  description?: string;
  
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

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen social debe ser una URL válida' })
  socialImageUrl?: string;
}

@InputType()
export class CategoryUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  description?: string;
  
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

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen social debe ser una URL válida' })
  socialImageUrl?: string;
} 