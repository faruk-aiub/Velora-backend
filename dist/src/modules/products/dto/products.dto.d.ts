export declare class CreateProductDto {
    title: string;
    description?: string;
    brand_id?: string;
    category_id: string;
    is_active?: boolean;
}
export declare class UpdateProductDto {
    title?: string;
    description?: string;
    brand_id?: string;
    category_id?: string;
    is_active?: boolean;
}
export declare class CreateVariantDto {
    sku: string;
    price: number;
    compare_price?: number;
    attributes?: Record<string, any>;
}
export declare class UpdateVariantDto {
    sku?: string;
    price?: number;
    compare_price?: number;
    attributes?: Record<string, any>;
}
export declare class CreateImageDto {
    url: string;
    alt_text?: string;
    sort_order?: number;
}
