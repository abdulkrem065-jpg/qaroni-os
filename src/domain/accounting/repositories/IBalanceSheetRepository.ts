import { BalanceSheet } from '../aggregates/BalanceSheet';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IBalanceSheetRepository {
    save(balanceSheet: BalanceSheet): Promise<void>;
    findById(id: BalanceSheetId, organizationId: OrganizationId): Promise<BalanceSheet | null>;
    findByOrganization(organizationId: OrganizationId): Promise<BalanceSheet[]>;
}
