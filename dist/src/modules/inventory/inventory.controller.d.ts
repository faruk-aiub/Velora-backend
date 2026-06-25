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
            quantity: number;
            reserved_quantity: number;
            product_variant_id: string;
        };
    }>;
    decrementStock(variantId: string, dto: UpdateStockDto): Promise<{
        message: string;
        data: {
            id: string;
            updated_at: Date;
            quantity: number;
            reserved_quantity: number;
            product_variant_id: string;
        };
    }>;
}
