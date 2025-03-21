import { InputType, Field } from 'type-graphql';
import { IsEmail, Length, MinLength } from 'class-validator';

@InputType()
export class UserInput {
  @Field()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @Field()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @Field({ nullable: true })
  role?: string;
} 