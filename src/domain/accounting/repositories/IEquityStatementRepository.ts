import { EquityStatement } from '../../../domain/accounting/aggregates/EquityStatement';
import { EquityStatementId } from '../../../domain/accounting/valueobjects/EquityStatementId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export interface IEquityStatementRepository {
    save(statement: EquityStatement): Promise<void>;
    findById(id: EquityStatementId, organizationId: OrganizationId): Promise<EquityStatement | null>;
}
