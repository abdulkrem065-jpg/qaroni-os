import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IIncomeStatement {
    generate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
