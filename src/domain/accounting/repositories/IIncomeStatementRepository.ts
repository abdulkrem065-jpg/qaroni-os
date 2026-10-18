import { IncomeStatement } from '../aggregates/IncomeStatement';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IIncomeStatementRepository {
    save(incomeStatement: IncomeStatement): Promise<void>;
    findById(id: IncomeStatementId, organizationId: OrganizationId): Promise<IncomeStatement | null>;
    findByOrganization(organizationId: OrganizationId): Promise<IncomeStatement[]>;
}
