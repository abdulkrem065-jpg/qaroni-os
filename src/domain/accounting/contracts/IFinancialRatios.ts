import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IFinancialRatios {
    calculate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
