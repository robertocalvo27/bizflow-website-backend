import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class TagInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre de la etiqueta es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}

@InputType()
export class TagUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}

@InputType()
export class TagFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
} 