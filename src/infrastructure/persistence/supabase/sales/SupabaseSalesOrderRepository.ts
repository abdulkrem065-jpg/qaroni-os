import { ISalesOrderRepository } from '../../../../domain/sales/repositories/ISalesOrderRepository';
import { SalesOrder, SalesOrderItem } from '../../../../domain/sales/aggregates/SalesOrder';
import { SalesOrderId } from '../../../../domain/shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { ProductId } from '../../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../../domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../../domain/shared/valueobjects/MoneyAmount';
import { SalesOrderStatus } from '../../../../domain/sales/types/SalesTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseSalesOrderRepository implements ISalesOrderRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): SalesOrder {
        const items = (row.items || []).map((i: any) => new SalesOrderItem(
            i.id,
            new ProductId(i.product_id),
            Quantity.create(i.quantity),
            MoneyAmount.create(i.unit_price),
            MoneyAmount.create(i.discount),
            MoneyAmount.create(i.tax)
        ));

        return SalesOrder.load(
            new SalesOrderId(row.id),
            new OrganizationId(row.organization_id),
            new BranchId(row.branch_id),
            new UserId(row.staff_id),
            items,
            row.status as SalesOrderStatus,
            new Date(row.created_at)
        );
    }

    private mapToRow(order: SalesOrder): any {
        return {
            id: order.id.value,
            organization_id: order.organizationId.value,
            branch_id: order.branchId.value,
            staff_id: order.staffId.value,
            status: order.status,
            created_at: order.createdAt.toISOString(),
            items: order.items.map(i => ({
                id: i.id,
                product_id: i.productId.value,
                quantity: i.quantity.value,
                unit_price: i.unitPrice.value,
                discount: i.discount.value,
                tax: i.tax.value
            }))
        };
    }

    public async save(order: SalesOrder): Promise<void> {
        const { error } = await this.supabase
            .from('sales_orders')
            .upsert(this.mapToRow(order));
        if (error) throw new Error(`Failed to save sales order: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: SalesOrderId, organizationId: OrganizationId): Promise<SalesOrder | null> {
        const { data, error } = await this.supabase
            .from('sales_orders')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByOrganizationId(organizationId: OrganizationId): Promise<SalesOrder[]> {
        const { data, error } = await this.supabase
            .from('sales_orders')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
