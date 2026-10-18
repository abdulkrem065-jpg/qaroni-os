import { IInventoryRepository } from '../../../../domain/inventory/repositories/IInventoryRepository';
import { InventoryItem } from '../../../../domain/inventory/aggregates/InventoryItem';
import { InventoryItemId } from '../../../../domain/shared/valueobjects/InventoryItemId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { ProductId } from '../../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../../domain/shared/valueobjects/Quantity';
import { ReorderLevel } from '../../../../domain/shared/valueobjects/ReorderLevel';
import { WarehouseLocationId } from '../../../../domain/shared/valueobjects/WarehouseLocationId';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseInventoryRepository implements IInventoryRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): InventoryItem {
        return InventoryItem.load(
            new InventoryItemId(row.id),
            new OrganizationId(row.organization_id),
            new BranchId(row.branch_id),
            new ProductId(row.product_id),
            Quantity.create(row.quantity),
            Quantity.create(row.reserved_quantity),
            ReorderLevel.create(row.reorder_level),
            row.location_id ? new WarehouseLocationId(row.location_id) : null
        );
    }

    private mapToRow(item: InventoryItem): any {
        return {
            id: item.id.value,
            organization_id: item.organizationId.value,
            branch_id: item.branchId.value,
            product_id: item.productId.value,
            quantity: item.quantity.value,
            reserved_quantity: item.reservedQuantity.value,
            reorder_level: item.reorderLevel.value,
            location_id: item.locationId?.value || null
        };
    }

    public async save(item: InventoryItem): Promise<void> {
        const { error } = await this.supabase
            .from('inventory_items')
            .upsert(this.mapToRow(item));
        if (error) throw new Error(`Failed to save inventory item: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: InventoryItemId, organizationId: OrganizationId): Promise<InventoryItem | null> {
        const { data, error } = await this.supabase
            .from('inventory_items')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByBranchIdAndProductId(branchId: BranchId, productId: ProductId): Promise<InventoryItem | null> {
        const { data, error } = await this.supabase
            .from('inventory_items')
            .select('*')
            .eq('branch_id', branchId.value)
            .eq('product_id', productId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByBranchId(branchId: BranchId): Promise<InventoryItem[]> {
        const { data, error } = await this.supabase
            .from('inventory_items')
            .select('*')
            .eq('branch_id', branchId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
