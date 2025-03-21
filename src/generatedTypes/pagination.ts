import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalItems: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}
