import { Payment } from '../aggregates/Payment';
import { PaymentId } from '../../shared/valueobjects/PaymentId';
import { InvoiceId } from '../../shared/valueobjects/InvoiceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IPaymentRepository {
    save(payment: Payment): Promise<void>;
    findByIdAndOrganizationId(id: PaymentId, organizationId: OrganizationId): Promise<Payment | null>;
    findByInvoiceId(invoiceId: InvoiceId): Promise<Payment[]>;
}
