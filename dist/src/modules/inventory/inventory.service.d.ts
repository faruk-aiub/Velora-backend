import { PrismaService } from '../../database/prisma.service';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    incrementStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        quantity: number;
        reserved_quantity: number;
        product_variant_id: string;
    }>;
    decrementStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        quantity: number;
        reserved_quantity: number;
        product_variant_id: string;
    }>;
    reserveStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        quantity: number;
        reserved_quantity: number;
        product_variant_id: string;
    }>;
    releaseReservedStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        quantity: number;
        reserved_quantity: number;
        product_variant_id: string;
    }>;
    commitStock(variantId: string, amount: number): Promise<{
        id: string;
        updated_at: Date;
        quantity: number;
        reserved_quantity: number;
        product_variant_id: string;
    }>;
    getLowStockVariants(threshold?: number): Promise<unknown>;
    getAllInventory(page?: number, limit?: number, search?: string): Promise<{
        data: unknown;
        total: any;
        page: number;
        limit: number;
    }>;
}
