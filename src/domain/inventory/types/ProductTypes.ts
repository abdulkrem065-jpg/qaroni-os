import { ProductName } from '../../shared/valueobjects/ProductName';
import { ProductCategory } from '../../shared/valueobjects/ProductCategory';
import { UnitOfMeasure } from '../../shared/valueobjects/UnitOfMeasure';
import { CostPrice } from '../../shared/valueobjects/CostPrice';
import { SellingPrice } from '../../shared/valueobjects/SellingPrice';

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export interface ProductDetails {
    name: ProductName;
    category: ProductCategory;
    description: string;
    uom: UnitOfMeasure;
}

export interface ProductPricing {
    costPrice: CostPrice;
    sellingPrice: SellingPrice;
}
