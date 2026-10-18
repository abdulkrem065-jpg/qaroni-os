export interface FinancialRatiosDTO {
    id: string;
    organizationId: string;
    balanceSheetId: string;
    incomeStatementId: string;
    cashFlowStatementId: string | null;
    periodEndDate: string;
    status: 'DRAFT' | 'PUBLISHED';
    generatedAt: string;
    results: {
        id: string;
        category: string;
        name: string;
        value: number | null;
        benchmark: number | null;
        status: string;
    }[];
}

export interface GenerateFinancialRatiosDTO {
    organizationId: string;
    balanceSheetId: string;
    incomeStatementId: string;
    cashFlowStatementId?: string;
    periodEndDate: string;
}
