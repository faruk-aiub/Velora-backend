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

export function getPaginationParams(page?: number, limit?: number, maxLimit: number = 50) {
  const parsedPage = Math.max(1, page ? Number(page) : 1);
  const effectiveMax = Math.max(maxLimit, 50);
  const parsedLimit = Math.min(effectiveMax, Math.max(1, limit ? Number(limit) : 20));
  const skip = (parsedPage - 1) * parsedLimit;

  return { skip, take: parsedLimit, page: parsedPage, limit: parsedLimit };
}
