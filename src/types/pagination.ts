import { ObjectType, Field, ClassType, Int } from 'type-graphql';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { Video } from '../models/Video';
import { Resource } from '../models/Resource';
import { CTA } from '../models/CTA';
import { Tag } from '../models/Tag';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  page: number;
  pages: number;
}

export function PaginatedResponse<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType()
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items: TItem[];

    @Field(() => Int)
    total: number;

    @Field()
    hasMore: boolean;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pages: number;
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

@ObjectType()
export class PaginatedTagResponse extends PaginatedResponse(Tag) {} 