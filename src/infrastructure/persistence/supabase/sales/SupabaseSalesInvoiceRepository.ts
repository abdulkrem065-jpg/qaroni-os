import { ISalesInvoiceRepository } from '../../../../domain/sales/repositories/ISalesInvoiceRepository';
import { SalesInvoice } from '../../../../domain/sales/aggregates/SalesInvoice';
import { InvoiceId } from '../../../../domain/shared/valueobjects/InvoiceId';
import { SalesOrderId } from '../../../../domain/shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { InvoiceNumber } from '../../../../domain/shared/valueobjects/InvoiceNumber';
import { MoneyAmount } from '../../../../domain/shared/valueobjects/MoneyAmount';
import { InvoiceStatus } from '../../../../domain/sales/types/SalesTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseSalesInvoiceRepository implements ISalesInvoiceRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): SalesInvoice {
        return SalesInvoice.load(
            new InvoiceId(row.id),
            new OrganizationId(row.organization_id),
            new SalesOrderId(row.sales_order_id),
            InvoiceNumber.create(row.invoice_number),
            MoneyAmount.create(row.total_amount),
            MoneyAmount.create(row.paid_amount),
            row.status as InvoiceStatus,
            new Date(row.created_at)
        );
    }

    private mapToRow(invoice: SalesInvoice): any {
        return {
            id: invoice.id.value,
            organization_id: invoice.organizationId.value,
            sales_order_id: invoice.salesOrderId.value,
            invoice_number: invoice.invoiceNumber.value,
            total_amount: invoice.totalAmount.value,
            paid_amount: invoice.paidAmount.value,
            status: invoice.status,
            created_at: invoice.createdAt.toISOString()
        };
    }

    public async save(invoice: SalesInvoice): Promise<void> {
        const { error } = await this.supabase
            .from('sales_invoices')
            .upsert(this.mapToRow(invoice));
        if (error) throw new Error(`Failed to save invoice: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: InvoiceId, organizationId: OrganizationId): Promise<SalesInvoice | null> {
        const { data, error } = await this.supabase
            .from('sales_invoices')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findBySalesOrderId(salesOrderId: SalesOrderId): Promise<SalesInvoice | null> {
        const { data, error } = await this.supabase
            .from('sales_invoices')
            .select('*')
            .eq('sales_order_id', salesOrderId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByInvoiceNumber(organizationId: OrganizationId, invoiceNumber: InvoiceNumber): Promise<SalesInvoice | null> {
        const { data, error } = await this.supabase
            .from('sales_invoices')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('invoice_number', invoiceNumber.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }
}
