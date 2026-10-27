import { InventoryService } from './inventory.service';
import { UpdateStockDto, SetStockDto } from './dto/inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getLowStock(threshold?: number): Promise<{
        data: unknown;
    }>;
    getAllInventory(page?: number, limit?: number, q?: string): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    setStock(variantId: string, dto: SetStockDto): Promise<{
        message: string;
        data: {
            id: string;
            product_variant_id: string;
            quantity: number;
            reserved_quantity: number;
            updated_at: Date;
        };
    }>;
    incrementStock(variantId: string, dto: UpdateStockDto): Promise<{
        message: string;
        data: {
            id: string;
            product_variant_id: string;
            quantity: number;
            reserved_quantity: number;
            updated_at: Date;
        };
    }>;
    decrementStock(variantId: string, dto: UpdateStockDto): Promise<{
        message: string;
        data: {
            id: string;
            product_variant_id: string;
            quantity: number;
            reserved_quantity: number;
            updated_at: Date;
        };
    }>;
}
