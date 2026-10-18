import { FiscalYearDTO, AccountingPeriodDTO } from '../dtos/FiscalPeriodDTO';

export interface IFiscalPeriodUseCases {
    createFiscalYear(organizationId: string, year: number, startDate: Date, endDate: Date): Promise<FiscalYearDTO>;
    closeFiscalYear(organizationId: string, fiscalYearId: string, userId: string): Promise<void>;
    changePeriodStatus(organizationId: string, fiscalYearId: string, periodId: string, newStatus: string, userId: string, reason: string): Promise<void>;
    getFiscalYear(organizationId: string, year: number): Promise<FiscalYearDTO | null>;
    getPeriodForDate(organizationId: string, date: Date): Promise<AccountingPeriodDTO | null>;
}
