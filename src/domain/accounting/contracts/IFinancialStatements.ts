import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IFinancialStatements {
    generateBalanceSheet(organizationId: OrganizationId, periodId: string): Promise<any>;
    generateIncomeStatement(organizationId: OrganizationId, periodId: string): Promise<any>;
}
