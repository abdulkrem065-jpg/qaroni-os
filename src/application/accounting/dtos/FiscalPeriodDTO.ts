export interface AccountingPeriodDTO {
    id: string;
    periodNumber: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface FiscalYearDTO {
    id: string;
    organizationId: string;
    year: number;
    startDate: string;
    endDate: string;
    status: string;
    periods: AccountingPeriodDTO[];
}
