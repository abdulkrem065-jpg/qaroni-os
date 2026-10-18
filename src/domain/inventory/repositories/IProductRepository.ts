import { Product } from '../aggregates/Product';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { SKU } from '../../shared/valueobjects/SKU';
import { Barcode } from '../../shared/valueobjects/Barcode';

export interface IProductRepository {
    save(product: Product): Promise<void>;
    findByIdAndOrganizationId(id: ProductId, organizationId: OrganizationId): Promise<Product | null>;
    findByOrganizationIdAndSKU(organizationId: OrganizationId, sku: SKU): Promise<Product | null>;
    findByOrganizationIdAndBarcode(organizationId: OrganizationId, barcode: Barcode): Promise<Product | null>;
    findAllByOrganizationId(organizationId: OrganizationId): Promise<Product[]>;
}
