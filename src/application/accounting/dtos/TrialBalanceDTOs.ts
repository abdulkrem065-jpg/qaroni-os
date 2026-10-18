export interface GenerateTrialBalanceDTO {
    organizationId: string;
    periodType: string;
    startDate: string;
    endDate: string;
}

export interface TrialBalanceAccountDTO {
    accountId: string;
    accountNumber: string;
    accountName: string;
    debit: number;
    credit: number;
}

export interface TrialBalanceDTO {
    id: string;
    organizationId: string;
    periodType: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
    totalDebit: number;
    totalCredit: number;
    accounts: TrialBalanceAccountDTO[];
}
