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
export declare function createPaginationResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
export declare function getPaginationParams(page?: number, limit?: number): {
    skip: number;
    take: number;
    page: number;
    limit: number;
};
