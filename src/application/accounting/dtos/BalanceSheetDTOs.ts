export interface GenerateBalanceSheetDTO {
    organizationId: string;
    trialBalanceId: string;
}

export interface BalanceSheetLineDTO {
    accountId: string;
    accountNumber: string;
    accountName: string;
    amount: number;
}

export interface BalanceSheetSectionDTO {
    mainSection: string;
    subSection: string;
    lines: BalanceSheetLineDTO[];
    total: number;
}

export interface BalanceSheetDTO {
    id: string;
    organizationId: string;
    trialBalanceId: string;
    startDate: string;
    endDate: string;
    status: string;
    generatedAt: string;
    assetsTotal: number;
    liabilitiesTotal: number;
    equityTotal: number;
    sections: BalanceSheetSectionDTO[];
}
