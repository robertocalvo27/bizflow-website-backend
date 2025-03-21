import { ObjectType, Field } from "type-graphql";
import { Video } from "../models/Video";
import { PaginationMeta } from "./pagination";

@ObjectType()
export class PaginatedVideos {
  @Field(() => [Video])
  items: Video[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
} 