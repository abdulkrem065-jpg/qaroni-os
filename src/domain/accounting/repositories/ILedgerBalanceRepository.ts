import { LedgerBalance } from '../aggregates/LedgerBalance';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { LedgerPeriod } from '../valueobjects/LedgerPeriod';

export interface ILedgerBalanceRepository {
    save(balance: LedgerBalance): Promise<void>;
    findByAccountAndPeriod(organizationId: OrganizationId, accountId: AccountId, period: LedgerPeriod): Promise<LedgerBalance | null>;
}
