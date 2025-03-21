import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { IsEmail, Length, MinLength, IsOptional } from 'class-validator';
import { User } from '../models/User';
import { SortInput, PageInfo, TextFilterInput } from './common.schema';

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt'
}

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  EDITOR = 'editor'
}

registerEnumType(UserSortField, {
  name: 'UserSortField',
  description: 'Campos por los que se puede ordenar los usuarios',
});

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Roles de usuario en el sistema',
});

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

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}

@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name?: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
  
  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  role?: UserRole;
}

@InputType()
export class UserFilterInput {
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  name?: TextFilterInput;
  
  @Field(() => TextFilterInput, { nullable: true })
  @IsOptional()
  email?: TextFilterInput;
  
  @Field(() => [UserRole], { nullable: true })
  @IsOptional()
  roles?: UserRole[];
}

@InputType()
export class UserSortInput extends SortInput {
  @Field(() => UserSortField)
  field: UserSortField = UserSortField.NAME;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  items: User[];
  
  @Field(() => PageInfo)
  pageInfo: PageInfo;
} 