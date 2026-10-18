import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';
import { FinancialRatiosId } from '../../../domain/accounting/valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export interface IFinancialRatiosRepository {
    save(ratios: FinancialRatios): Promise<void>;
    findById(organizationId: OrganizationId, id: FinancialRatiosId): Promise<FinancialRatios | null>;
    findByOrganizationId(organizationId: OrganizationId): Promise<FinancialRatios[]>;
}
