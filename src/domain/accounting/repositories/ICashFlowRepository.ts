import { CashFlowStatement } from '../aggregates/CashFlowStatement';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ICashFlowRepository {
    save(cashFlow: CashFlowStatement): Promise<void>;
    findById(id: CashFlowStatementId, organizationId: OrganizationId): Promise<CashFlowStatement | null>;
    findByOrganization(organizationId: OrganizationId): Promise<CashFlowStatement[]>;
}
