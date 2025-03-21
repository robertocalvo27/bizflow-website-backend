import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { Length, MaxLength, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { Category } from '../models/Category';
import { SortInput, PageInfo, TextFilterInput } from './common.schema';

export enum CategorySortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

registerEnumType(CategorySortField, {
  name: 'CategorySortField',
  description: 'Campos por los que se puede ordenar las categorías',
});

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

@InputType()
export class CategoryFilterInput {
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  name?: TextFilterInput;
  
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  description?: TextFilterInput;
  
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  indexable?: boolean;
}

@InputType()
export class CategorySortInput extends SortInput {
  @Field(() => CategorySortField)
  field: CategorySortField = CategorySortField.NAME;
}

@ObjectType()
export class PaginatedCategories {
  @Field(() => [Category])
  items: Category[];
  
  @Field(() => PageInfo)
  pageInfo: PageInfo;
} 