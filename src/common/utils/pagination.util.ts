export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    },
  };
}

export function getPaginationParams(page?: number, limit?: number) {
  const parsedPage = Math.max(1, page ? Number(page) : 1);
  const parsedLimit = Math.min(50, Math.max(1, limit ? Number(limit) : 20)); // Rule 2: Max 50, Default 20
  const skip = (parsedPage - 1) * parsedLimit;

  return { skip, take: parsedLimit, page: parsedPage, limit: parsedLimit };
}
