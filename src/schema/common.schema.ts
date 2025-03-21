import { InputType, Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import { IsOptional, Min, Max } from 'class-validator';

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC"
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Dirección de ordenamiento (ascendente o descendente)',
});

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @Min(0)
  offset?: number = 0;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

@InputType()
export class SortInput {
  @Field()
  field: string;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;
}

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

// Filtro genérico para fechas
@InputType()
export class DateFilterInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  from?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  to?: Date;
}

// Filtro genérico para búsqueda de texto
@InputType()
export class TextFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  contains?: string;

  @Field({ nullable: true })
  @IsOptional()
  startsWith?: string;

  @Field({ nullable: true })
  @IsOptional()
  endsWith?: string;

  @Field({ nullable: true })
  @IsOptional()
  equals?: string;
} 