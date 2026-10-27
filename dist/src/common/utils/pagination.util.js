"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationResponse = createPaginationResponse;
exports.getPaginationParams = getPaginationParams;
function createPaginationResponse(data, total, page, limit) {
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
function getPaginationParams(page, limit, maxLimit = 50) {
    const parsedPage = Math.max(1, page ? Number(page) : 1);
    const effectiveMax = Math.max(maxLimit, 50);
    const parsedLimit = Math.min(effectiveMax, Math.max(1, limit ? Number(limit) : 20));
    const skip = (parsedPage - 1) * parsedLimit;
    return { skip, take: parsedLimit, page: parsedPage, limit: parsedLimit };
}
//# sourceMappingURL=pagination.util.js.map