export interface CashFlowLineDTO {
    id: string;
    accountId: string | null;
    description: string;
    amount: number;
}

export interface CashFlowSectionDTO {
    id: string;
    mainSection: 'OPERATING' | 'INVESTING' | 'FINANCING';
    lines: CashFlowLineDTO[];
    total: number;
}

export interface GenerateCashFlowDTO {
    organizationId: string;
    startBalanceSheetId: string;
    endBalanceSheetId: string;
    incomeStatementId: string;
    sections: {
        mainSection: 'OPERATING' | 'INVESTING' | 'FINANCING';
        lines: {
            accountId: string | null;
            description: string;
            amount: number;
        }[];
    }[];
}

export interface CashFlowStatementDTO {
    id: string;
    organizationId: string;
    startBalanceSheetId: string;
    endBalanceSheetId: string;
    incomeStatementId: string;
    startDate: string;
    endDate: string;
    sections: CashFlowSectionDTO[];
    openingCash: number;
    closingCash: number;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashMovement: number;
    status: string;
    generatedAt: string;
}
