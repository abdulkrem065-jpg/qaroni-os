import { IGoodsReceiptRepository } from '../../../../domain/purchasing/repositories/IGoodsReceiptRepository';
import { GoodsReceipt, GoodsReceiptItem } from '../../../../domain/purchasing/aggregates/GoodsReceipt';
import { GoodsReceiptId } from '../../../../domain/shared/valueobjects/GoodsReceiptId';
import { PurchaseOrderId } from '../../../../domain/shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { GoodsReceiptNumber } from '../../../../domain/shared/valueobjects/GoodsReceiptNumber';
import { ProductId } from '../../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../../domain/shared/valueobjects/Quantity';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseGoodsReceiptRepository implements IGoodsReceiptRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): GoodsReceipt {
        const items = (row.items || []).map((i: any) => new GoodsReceiptItem(
            new ProductId(i.product_id),
            Quantity.create(i.received_quantity)
        ));

        return GoodsReceipt.load(
            new GoodsReceiptId(row.id),
            new OrganizationId(row.organization_id),
            new BranchId(row.branch_id),
            new PurchaseOrderId(row.purchase_order_id),
            GoodsReceiptNumber.create(row.receipt_number),
            new UserId(row.received_by),
            items,
            new Date(row.received_at)
        );
    }

    private mapToRow(receipt: GoodsReceipt): any {
        return {
            id: receipt.id.value,
            organization_id: receipt.organizationId.value,
            branch_id: receipt.branchId.value,
            purchase_order_id: receipt.purchaseOrderId.value,
            receipt_number: receipt.receiptNumber.value,
            received_by: receipt.receivedBy.value,
            received_at: receipt.receivedAt.toISOString(),
            items: receipt.items.map(i => ({
                product_id: i.productId.value,
                received_quantity: i.receivedQuantity.value
            }))
        };
    }

    public async save(receipt: GoodsReceipt): Promise<void> {
        const { error } = await this.supabase
            .from('goods_receipts')
            .upsert(this.mapToRow(receipt));
        if (error) throw new Error(`Failed to save goods receipt: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: GoodsReceiptId, organizationId: OrganizationId): Promise<GoodsReceipt | null> {
        const { data, error } = await this.supabase
            .from('goods_receipts')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByPurchaseOrderId(purchaseOrderId: PurchaseOrderId): Promise<GoodsReceipt[]> {
        const { data, error } = await this.supabase
            .from('goods_receipts')
            .select('*')
            .eq('purchase_order_id', purchaseOrderId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
