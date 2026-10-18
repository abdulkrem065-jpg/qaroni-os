import { SalesInvoice } from '../aggregates/SalesInvoice';
import { InvoiceId } from '../../shared/valueobjects/InvoiceId';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { InvoiceNumber } from '../../shared/valueobjects/InvoiceNumber';

export interface ISalesInvoiceRepository {
    save(invoice: SalesInvoice): Promise<void>;
    findByIdAndOrganizationId(id: InvoiceId, organizationId: OrganizationId): Promise<SalesInvoice | null>;
    findBySalesOrderId(salesOrderId: SalesOrderId): Promise<SalesInvoice | null>;
    findByInvoiceNumber(organizationId: OrganizationId, invoiceNumber: InvoiceNumber): Promise<SalesInvoice | null>;
}
