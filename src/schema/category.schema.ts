import { InputType, Field } from 'type-graphql';
import { Length, MaxLength } from 'class-validator';

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
} 