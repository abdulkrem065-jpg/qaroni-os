import { IProductRepository } from '../../../../domain/inventory/repositories/IProductRepository';
import { Product } from '../../../../domain/inventory/aggregates/Product';
import { ProductId } from '../../../../domain/shared/valueobjects/ProductId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { SKU } from '../../../../domain/shared/valueobjects/SKU';
import { Barcode } from '../../../../domain/shared/valueobjects/Barcode';
import { ProductName } from '../../../../domain/shared/valueobjects/ProductName';
import { ProductCategory } from '../../../../domain/shared/valueobjects/ProductCategory';
import { UnitOfMeasure } from '../../../../domain/shared/valueobjects/UnitOfMeasure';
import { CostPrice } from '../../../../domain/shared/valueobjects/CostPrice';
import { SellingPrice } from '../../../../domain/shared/valueobjects/SellingPrice';
import { ProductStatus } from '../../../../domain/inventory/types/ProductTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProductRepository implements IProductRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): Product {
        const details = {
            name: ProductName.create(row.name),
            category: ProductCategory.create(row.category),
            description: row.description,
            uom: UnitOfMeasure.create(row.uom)
        };
        const pricing = {
            costPrice: CostPrice.create(row.cost_price),
            sellingPrice: SellingPrice.create(row.selling_price)
        };
        return Product.load(
            new ProductId(row.id),
            new OrganizationId(row.organization_id),
            SKU.create(row.sku),
            row.barcode ? Barcode.create(row.barcode) : null,
            details,
            pricing,
            row.status as ProductStatus
        );
    }

    private mapToRow(product: Product): any {
        return {
            id: product.id.value,
            organization_id: product.organizationId.value,
            sku: product.sku.value,
            barcode: product.barcode?.value || null,
            name: product.details.name.value,
            category: product.details.category.value,
            description: product.details.description,
            uom: product.details.uom.value,
            cost_price: product.pricing.costPrice.amount,
            selling_price: product.pricing.sellingPrice.amount,
            status: product.status
        };
    }

    public async save(product: Product): Promise<void> {
        const { error } = await this.supabase
            .from('products')
            .upsert(this.mapToRow(product));
        if (error) throw new Error(`Failed to save product: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: ProductId, organizationId: OrganizationId): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByOrganizationIdAndSKU(organizationId: OrganizationId, sku: SKU): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('sku', sku.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByOrganizationIdAndBarcode(organizationId: OrganizationId, barcode: Barcode): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('barcode', barcode.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByOrganizationId(organizationId: OrganizationId): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
