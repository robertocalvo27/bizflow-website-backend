import { InputType, Field, Int } from 'type-graphql';
import { IsOptional, Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite debe ser menor o igual a 100' })
  limit?: number;
} 