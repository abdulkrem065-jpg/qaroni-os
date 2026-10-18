import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ICashFlow {
    generateStatement(organizationId: OrganizationId, periodId: string): Promise<any>;
}
