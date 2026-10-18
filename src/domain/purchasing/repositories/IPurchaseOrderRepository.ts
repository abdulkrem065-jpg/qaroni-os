import { PurchaseOrder } from '../aggregates/PurchaseOrder';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IPurchaseOrderRepository {
    save(order: PurchaseOrder): Promise<void>;
    findByIdAndOrganizationId(id: PurchaseOrderId, organizationId: OrganizationId): Promise<PurchaseOrder | null>;
    findAllByOrganizationId(organizationId: OrganizationId): Promise<PurchaseOrder[]>;
}
