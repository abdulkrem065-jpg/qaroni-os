import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ITrialBalance {
    calculate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
