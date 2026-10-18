import { SalesOrder } from '../aggregates/SalesOrder';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ISalesOrderRepository {
    save(order: SalesOrder): Promise<void>;
    findByIdAndOrganizationId(id: SalesOrderId, organizationId: OrganizationId): Promise<SalesOrder | null>;
    findAllByOrganizationId(organizationId: OrganizationId): Promise<SalesOrder[]>;
}
