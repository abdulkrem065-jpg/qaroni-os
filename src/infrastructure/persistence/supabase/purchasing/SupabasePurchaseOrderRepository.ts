import { IPurchaseOrderRepository } from '../../../../domain/purchasing/repositories/IPurchaseOrderRepository';
import { PurchaseOrder, PurchaseOrderItem } from '../../../../domain/purchasing/aggregates/PurchaseOrder';
import { PurchaseOrderId } from '../../../../domain/shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { ProductId } from '../../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../../domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../../domain/shared/valueobjects/MoneyAmount';
import { SupplierId } from '../../../../domain/shared/valueobjects/SupplierId';
import { PurchaseStatus } from '../../../../domain/purchasing/types/PurchasingTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePurchaseOrderRepository implements IPurchaseOrderRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): PurchaseOrder {
        const items = (row.items || []).map((i: any) => new PurchaseOrderItem(
            i.id,
            new ProductId(i.product_id),
            Quantity.create(i.quantity),
            MoneyAmount.create(i.unit_price),
            Quantity.create(i.received_quantity)
        ));

        return PurchaseOrder.load(
            new PurchaseOrderId(row.id),
            new OrganizationId(row.organization_id),
            new BranchId(row.branch_id),
            new SupplierId(row.supplier_id),
            new UserId(row.created_by),
            items,
            row.status as PurchaseStatus,
            new Date(row.created_at)
        );
    }

    private mapToRow(order: PurchaseOrder): any {
        return {
            id: order.id.value,
            organization_id: order.organizationId.value,
            branch_id: order.branchId.value,
            supplier_id: order.supplierId.value,
            created_by: order.createdBy.value,
            status: order.status,
            created_at: order.createdAt.toISOString(),
            items: order.items.map(i => ({
                id: i.id,
                product_id: i.productId.value,
                quantity: i.quantity.value,
                unit_price: i.unitPrice.value,
                received_quantity: i.receivedQuantity.value
            }))
        };
    }

    public async save(order: PurchaseOrder): Promise<void> {
        const { error } = await this.supabase
            .from('purchase_orders')
            .upsert(this.mapToRow(order));
        if (error) throw new Error(`Failed to save purchase order: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: PurchaseOrderId, organizationId: OrganizationId): Promise<PurchaseOrder | null> {
        const { data, error } = await this.supabase
            .from('purchase_orders')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByOrganizationId(organizationId: OrganizationId): Promise<PurchaseOrder[]> {
        const { data, error } = await this.supabase
            .from('purchase_orders')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
