import { IReceiptRepository } from '../../../../domain/sales/repositories/IReceiptRepository';
import { Receipt } from '../../../../domain/sales/aggregates/Receipt';
import { ReceiptId } from '../../../../domain/shared/valueobjects/ReceiptId';
import { SalesOrderId } from '../../../../domain/shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { ReceiptNumber } from '../../../../domain/shared/valueobjects/ReceiptNumber';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseReceiptRepository implements IReceiptRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): Receipt {
        return Receipt.load(
            new ReceiptId(row.id),
            new OrganizationId(row.organization_id),
            new SalesOrderId(row.sales_order_id),
            ReceiptNumber.create(row.receipt_number),
            new Date(row.printed_at)
        );
    }

    private mapToRow(receipt: Receipt): any {
        return {
            id: receipt.id.value,
            organization_id: receipt.organizationId.value,
            sales_order_id: receipt.salesOrderId.value,
            receipt_number: receipt.receiptNumber.value,
            printed_at: receipt.printedAt.toISOString()
        };
    }

    public async save(receipt: Receipt): Promise<void> {
        const { error } = await this.supabase
            .from('receipts')
            .upsert(this.mapToRow(receipt));
        if (error) throw new Error(`Failed to save receipt: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: ReceiptId, organizationId: OrganizationId): Promise<Receipt | null> {
        const { data, error } = await this.supabase
            .from('receipts')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findBySalesOrderId(salesOrderId: SalesOrderId): Promise<Receipt[]> {
        const { data, error } = await this.supabase
            .from('receipts')
            .select('*')
            .eq('sales_order_id', salesOrderId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }

    public async findByReceiptNumber(organizationId: OrganizationId, receiptNumber: ReceiptNumber): Promise<Receipt | null> {
        const { data, error } = await this.supabase
            .from('receipts')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('receipt_number', receiptNumber.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }
}
