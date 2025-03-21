import { ObjectType, Field, ClassType } from 'type-graphql';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { Video } from '../models/Video';
import { Resource } from '../models/Resource';
import { CTA } from '../models/CTA';

export function PaginatedResponse<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType()
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items: TItem[];

    @Field()
    totalCount: number;

    @Field()
    hasMore: boolean;
  }
  return PaginatedResponseClass;
}

@ObjectType()
export class PaginatedPostResponse extends PaginatedResponse(Post) {}

@ObjectType()
export class PaginatedCategoryResponse extends PaginatedResponse(Category) {}

@ObjectType()
export class PaginatedVideoResponse extends PaginatedResponse(Video) {}

@ObjectType()
export class PaginatedResourceResponse extends PaginatedResponse(Resource) {}

@ObjectType()
export class PaginatedCTAResponse extends PaginatedResponse(CTA) {} 