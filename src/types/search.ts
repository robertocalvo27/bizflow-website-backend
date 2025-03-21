import { ObjectType, Field, Int } from 'type-graphql';
import { Post } from '../models/Post';
import { Video } from '../models/Video';

@ObjectType()
export class SearchResult {
  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => Video, { nullable: true })
  video?: Video;

  @Field(() => String)
  type: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Int)
  relevanceScore: number;
}

@ObjectType()
export class SearchResults {
  @Field(() => [SearchResult])
  items: SearchResult[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pages: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType()
export class RelatedContent {
  @Field(() => [SearchResult])
  items: SearchResult[];

  @Field(() => Int)
  total: number;
} 