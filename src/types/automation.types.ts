import { Field, ObjectType, InputType, ID } from 'type-graphql';
import { SEOMetadata, SEOMetadataInput } from './common.types';

export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  FAILED = 'failed'
}

@ObjectType()
export class AutomatedContent {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => SEOMetadata, { nullable: true })
  seoMetadata?: SEOMetadata;

  @Field(() => PublishStatus)
  status: PublishStatus;

  @Field(() => ContentSource)
  source: ContentSource;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ContentSource {
  @Field()
  type: string;

  @Field({ nullable: true })
  originalUrl?: string;

  @Field({ nullable: true })
  rssSource?: string;

  @Field({ nullable: true })
  confidence?: number;
}

@ObjectType()
export class AutomationResponse {
  @Field()
  success: boolean;

  @Field(() => ID, { nullable: true })
  postId?: string;

  @Field()
  status: string;

  @Field(() => [String], { nullable: true })
  errors?: string[];

  @Field(() => [String], { nullable: true })
  warnings?: string[];
}

@InputType()
export class AutomatedContentInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => SEOMetadataInput, { nullable: true })
  seoMetadata?: SEOMetadataInput;

  @Field(() => ContentSourceInput)
  source: ContentSourceInput;
}

@InputType()
export class ContentSourceInput {
  @Field()
  type: string;

  @Field({ nullable: true })
  originalUrl?: string;

  @Field({ nullable: true })
  rssSource?: string;

  @Field({ nullable: true })
  confidence?: number;
} 