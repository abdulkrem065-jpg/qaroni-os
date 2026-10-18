import { BalanceSheetMainSection, BalanceSheetSubSection } from '../valueobjects/BalanceSheetClassification';

export interface AccountClassification {
    mainSection: BalanceSheetMainSection;
    subSection: BalanceSheetSubSection;
    normalBalance: 'DEBIT' | 'CREDIT';
}

export interface IAccountClassificationService {
    classify(accountNumber: string): AccountClassification;
}
