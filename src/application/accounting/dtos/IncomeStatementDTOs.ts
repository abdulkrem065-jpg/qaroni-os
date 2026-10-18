export interface GenerateIncomeStatementDTO {
    organizationId: string;
    trialBalanceId: string;
}

export interface IncomeStatementLineDTO {
    id: string;
    accountId: string;
    accountNumber: string;
    accountName: string;
    amount: number;
}

export interface IncomeStatementSectionDTO {
    id: string;
    mainSection: string;
    subSection: string;
    total: number;
    lines: IncomeStatementLineDTO[];
}

export interface IncomeStatementDTO {
    id: string;
    organizationId: string;
    trialBalanceId: string;
    startDate: string;
    endDate: string;
    status: string;
    generatedAt: string;
    sections: IncomeStatementSectionDTO[];
    revenueTotal: number;
    expenseTotal: number;
    grossProfit: number;
    operatingProfit: number;
    netProfit: number;
}
