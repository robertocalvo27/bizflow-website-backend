import { InputType, Field, registerEnumType, Int } from 'type-graphql';
import { IsOptional, IsString, IsArray, IsEnum, IsDate } from 'class-validator';
import { SortOrder } from './common.schema';

export enum ContentType {
  POST = 'POST',
  VIDEO = 'VIDEO',
  ALL = 'ALL'
}

registerEnumType(ContentType, {
  name: 'ContentType',
  description: 'Tipo de contenido a buscar',
});

@InputType()
export class SearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  query?: string;

  @Field(() => ContentType, { defaultValue: ContentType.ALL })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  toDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

@InputType()
export class RelatedContentInput {
  @Field()
  @IsString()
  contentId: string;

  @Field(() => ContentType)
  @IsEnum(ContentType)
  type: ContentType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  excludeIds?: string[];

  @Field(() => Int, { defaultValue: 5 })
  @IsOptional()
  limit?: number;
} 