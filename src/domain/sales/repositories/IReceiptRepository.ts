import { Receipt } from '../aggregates/Receipt';
import { ReceiptId } from '../../shared/valueobjects/ReceiptId';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { ReceiptNumber } from '../../shared/valueobjects/ReceiptNumber';

export interface IReceiptRepository {
    save(receipt: Receipt): Promise<void>;
    findByIdAndOrganizationId(id: ReceiptId, organizationId: OrganizationId): Promise<Receipt | null>;
    findBySalesOrderId(salesOrderId: SalesOrderId): Promise<Receipt[]>;
    findByReceiptNumber(organizationId: OrganizationId, receiptNumber: ReceiptNumber): Promise<Receipt | null>;
}
