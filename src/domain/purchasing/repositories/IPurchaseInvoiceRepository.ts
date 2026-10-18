import { PurchaseInvoice } from '../aggregates/PurchaseInvoice';
import { PurchaseInvoiceId } from '../../shared/valueobjects/PurchaseInvoiceId';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IPurchaseInvoiceRepository {
    save(invoice: PurchaseInvoice): Promise<void>;
    findByIdAndOrganizationId(id: PurchaseInvoiceId, organizationId: OrganizationId): Promise<PurchaseInvoice | null>;
    findByPurchaseOrderId(purchaseOrderId: PurchaseOrderId): Promise<PurchaseInvoice | null>;
}
