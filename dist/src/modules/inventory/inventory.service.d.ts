import { PrismaService } from '../../database/prisma.service';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    incrementStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
    }>;
    decrementStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
    }>;
    reserveStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
    }>;
    releaseReservedStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
    }>;
    commitStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        product_variant_id: string;
        quantity: number;
        reserved_quantity: number;
    }>;
    getLowStockVariants(threshold?: number): Promise<unknown>;
    getAllInventory(page?: number, limit?: number, search?: string): Promise<{
        data: unknown;
        total: any;
        page: number;
        limit: number;
    }>;
}
