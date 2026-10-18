import { GoodsReceipt } from '../aggregates/GoodsReceipt';
import { GoodsReceiptId } from '../../shared/valueobjects/GoodsReceiptId';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IGoodsReceiptRepository {
    save(receipt: GoodsReceipt): Promise<void>;
    findByIdAndOrganizationId(id: GoodsReceiptId, organizationId: OrganizationId): Promise<GoodsReceipt | null>;
    findByPurchaseOrderId(purchaseOrderId: PurchaseOrderId): Promise<GoodsReceipt[]>;
}
