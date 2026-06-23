import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getLowStock(threshold?: number): Promise<{
        data: unknown;
    }>;
    incrementStock(variantId: string, dto: UpdateStockDto): Promise<{
        message: string;
        data: {
            id: string;
            updated_at: Date;
            product_variant_id: string;
            quantity: number;
            reserved_quantity: number;
        };
    }>;
    decrementStock(variantId: string, dto: UpdateStockDto): Promise<{
        message: string;
        data: {
            id: string;
            updated_at: Date;
            product_variant_id: string;
            quantity: number;
            reserved_quantity: number;
        };
    }>;
}
