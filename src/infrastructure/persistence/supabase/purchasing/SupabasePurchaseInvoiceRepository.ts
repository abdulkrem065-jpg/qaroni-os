import { IPurchaseInvoiceRepository } from '../../../../domain/purchasing/repositories/IPurchaseInvoiceRepository';
import { PurchaseInvoice } from '../../../../domain/purchasing/aggregates/PurchaseInvoice';
import { PurchaseInvoiceId } from '../../../../domain/shared/valueobjects/PurchaseInvoiceId';
import { PurchaseOrderId } from '../../../../domain/shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { PurchaseInvoiceNumber } from '../../../../domain/shared/valueobjects/PurchaseInvoiceNumber';
import { PurchaseTotal } from '../../../../domain/shared/valueobjects/PurchaseTotal';
import { PurchaseInvoiceStatus } from '../../../../domain/purchasing/types/PurchasingTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePurchaseInvoiceRepository implements IPurchaseInvoiceRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): PurchaseInvoice {
        return PurchaseInvoice.load(
            new PurchaseInvoiceId(row.id),
            new OrganizationId(row.organization_id),
            new PurchaseOrderId(row.purchase_order_id),
            PurchaseInvoiceNumber.create(row.invoice_number),
            PurchaseTotal.create(row.total_amount),
            PurchaseTotal.create(row.paid_amount),
            row.status as PurchaseInvoiceStatus,
            new Date(row.created_at)
        );
    }

    private mapToRow(invoice: PurchaseInvoice): any {
        return {
            id: invoice.id.value,
            organization_id: invoice.organizationId.value,
            purchase_order_id: invoice.purchaseOrderId.value,
            invoice_number: invoice.invoiceNumber.value,
            total_amount: invoice.totalAmount.value,
            paid_amount: invoice.paidAmount.value,
            status: invoice.status,
            created_at: invoice.createdAt.toISOString()
        };
    }

    public async save(invoice: PurchaseInvoice): Promise<void> {
        const { error } = await this.supabase
            .from('purchase_invoices')
            .upsert(this.mapToRow(invoice));
        if (error) throw new Error(`Failed to save purchase invoice: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: PurchaseInvoiceId, organizationId: OrganizationId): Promise<PurchaseInvoice | null> {
        const { data, error } = await this.supabase
            .from('purchase_invoices')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByPurchaseOrderId(purchaseOrderId: PurchaseOrderId): Promise<PurchaseInvoice | null> {
        const { data, error } = await this.supabase
            .from('purchase_invoices')
            .select('*')
            .eq('purchase_order_id', purchaseOrderId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }
}
