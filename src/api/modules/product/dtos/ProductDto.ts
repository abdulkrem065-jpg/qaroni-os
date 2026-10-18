export interface CreateProductDto {
    sku: string;
    barcode?: string;
    name: string;
    category: string;
    description: string;
    uom: string;
    costPrice: number;
    sellingPrice: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
