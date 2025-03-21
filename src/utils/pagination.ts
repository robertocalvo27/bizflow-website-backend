import { Repository, FindOptionsWhere, FindOptionsRelations, ObjectLiteral, FindOptionsOrder } from "typeorm";
import { PaginationMeta } from "../generatedTypes/pagination";

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

interface PaginateOptions<T extends ObjectLiteral> {
  repository: Repository<T>;
  page: number;
  limit: number;
  where?: FindOptionsWhere<T>;
  relations?: FindOptionsRelations<T>;
  order?: FindOptionsOrder<T>;
}

export async function paginateResults<T extends ObjectLiteral>(
  options: PaginateOptions<T>
): Promise<PaginatedResult<T>> {
  const { repository, page, limit, where, relations, order } = options;
  
  const skip = (page - 1) * limit;
  
  // Get total count
  const totalItems = await repository.count({ where });
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  // Get paginated results
  const defaultOrder = { createdAt: "DESC" } as unknown as FindOptionsOrder<T>;
  
  const items = await repository.find({
    where,
    relations,
    order: order || defaultOrder,
    skip,
    take: limit
  });
  
  // Create pagination metadata
  const meta: PaginationMeta = {
    currentPage: page,
    totalPages,
    itemsPerPage: limit,
    totalItems,
    hasNextPage,
    hasPreviousPage
  };
  
  return {
    meta,
    items
  };
} 