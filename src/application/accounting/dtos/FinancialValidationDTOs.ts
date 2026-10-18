export interface ExecuteValidationDTO {
    organizationId: string;
    category: string; // e.g. 'ALL', 'TRIAL_BALANCE', 'LEDGER_INTEGRITY', etc.
}

export interface ValidationIssueDTO {
    ruleCode: string;
    severity: string;
    message: string;
    referenceId?: string;
}

export interface ValidationResultDTO {
    category: string;
    isValid: boolean;
    executionTimeMs: number;
    issues: ValidationIssueDTO[];
}

export interface FinancialValidationDTO {
    id: string;
    organizationId: string;
    targetCategory: string;
    status: string;
    executedAt: string;
    isPassed: boolean;
    results: ValidationResultDTO[];
}
