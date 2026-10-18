import { IncomeStatementMainSection, IncomeStatementSubSection } from '../valueobjects/IncomeStatementClassification';

export interface IncomeClassification {
    mainSection: IncomeStatementMainSection;
    subSection: IncomeStatementSubSection;
    normalBalance: 'DEBIT' | 'CREDIT';
}

export interface IIncomeStatementClassificationService {
    classify(accountNumber: string): IncomeClassification | null; // returns null if not an income statement account
}
