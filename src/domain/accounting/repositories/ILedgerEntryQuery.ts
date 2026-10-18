import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';

export interface LedgerAccountBalance {
    accountId: string;
    accountNumber: string;
    accountName: string;
    totalDebit: number;
    totalCredit: number;
}

export interface ILedgerEntryQuery {
    calculateBalancesByDateRange(organizationId: OrganizationId, startDate: Date, endDate: Date): Promise<LedgerAccountBalance[]>;
}
