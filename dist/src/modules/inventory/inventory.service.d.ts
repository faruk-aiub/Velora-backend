import { PrismaService } from '../../database/prisma.service';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    incrementStock(variantId: string, amount: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    decrementStock(variantId: string, amount: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    reserveStock(variantId: string, amount: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    releaseReservedStock(variantId: string, amount: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    commitStock(variantId: string, amount: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    getLowStockVariants(threshold?: number): Promise<unknown>;
    updateStock(variantId: string, quantity: number): Promise<{
        id: string;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
        updated_at: Date;
    }>;
    getAllInventory(page?: number, limit?: number, search?: string): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
}
