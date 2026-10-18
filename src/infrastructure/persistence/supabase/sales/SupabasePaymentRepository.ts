import { IPaymentRepository } from '../../../../domain/sales/repositories/IPaymentRepository';
import { Payment } from '../../../../domain/sales/aggregates/Payment';
import { PaymentId } from '../../../../domain/shared/valueobjects/PaymentId';
import { InvoiceId } from '../../../../domain/shared/valueobjects/InvoiceId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { MoneyAmount } from '../../../../domain/shared/valueobjects/MoneyAmount';
import { PaymentMethod, PaymentStatus } from '../../../../domain/sales/types/SalesTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePaymentRepository implements IPaymentRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): Payment {
        return Payment.load(
            new PaymentId(row.id),
            new OrganizationId(row.organization_id),
            new InvoiceId(row.invoice_id),
            MoneyAmount.create(row.amount),
            row.method as PaymentMethod,
            row.status as PaymentStatus,
            new Date(row.created_at)
        );
    }

    private mapToRow(payment: Payment): any {
        return {
            id: payment.id.value,
            organization_id: payment.organizationId.value,
            invoice_id: payment.invoiceId.value,
            amount: payment.amount.value,
            method: payment.method,
            status: payment.status,
            created_at: payment.createdAt.toISOString()
        };
    }

    public async save(payment: Payment): Promise<void> {
        const { error } = await this.supabase
            .from('payments')
            .upsert(this.mapToRow(payment));
        if (error) throw new Error(`Failed to save payment: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: PaymentId, organizationId: OrganizationId): Promise<Payment | null> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByInvoiceId(invoiceId: InvoiceId): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('invoice_id', invoiceId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
