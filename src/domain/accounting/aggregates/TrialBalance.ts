import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TrialBalancePeriod } from '../valueobjects/TrialBalancePeriod';
import { DebitTotal } from '../valueobjects/DebitTotal';
import { CreditTotal } from '../valueobjects/CreditTotal';
import { TrialBalanceAccount } from '../entities/TrialBalanceAccount';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { EntityId } from '../../shared/valueobjects/EntityId';
import * as crypto from 'crypto';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';

export class TrialBalance extends AggregateRoot<TrialBalanceId> {
    private constructor(
        id: TrialBalanceId,
        private readonly _organizationId: OrganizationId,
        private readonly _period: TrialBalancePeriod,
        private _accounts: TrialBalanceAccount[],
        private readonly _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: TrialBalanceId,
        organizationId: OrganizationId,
        period: TrialBalancePeriod,
        accounts: TrialBalanceAccount[]
    ): TrialBalance {
        const tb = new TrialBalance(id, organizationId, period, accounts, new Date());
        tb.validateBalance();
        return tb;
    }

    public static load(
        id: TrialBalanceId,
        organizationId: OrganizationId,
        period: TrialBalancePeriod,
        accounts: TrialBalanceAccount[],
        generatedAt: Date
    ): TrialBalance {
        return new TrialBalance(id, organizationId, period, accounts, generatedAt);
    }

    public validateBalance(): void {
        const totalDebit = this.calculateTotalDebit();
        const totalCredit = this.calculateTotalCredit();

        // Use a small epsilon to account for floating point errors if needed, but here we assume exact math or cents integer
        if (Math.abs(totalDebit.value - totalCredit.value) > 0.001) {
            throw new BusinessRuleError(`Trial Balance Imbalance Detected: Debit (${totalDebit.value}) != Credit (${totalCredit.value})`);
        }
    }

    public calculateTotalDebit(): DebitTotal {
        const total = this._accounts.reduce((sum, acc) => sum + acc.balance.debit.value, 0);
        return new DebitTotal(total);
    }

    public calculateTotalCredit(): CreditTotal {
        const total = this._accounts.reduce((sum, acc) => sum + acc.balance.credit.value, 0);
        return new CreditTotal(total);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get period(): TrialBalancePeriod { return this._period; }
    public get accounts(): ReadonlyArray<TrialBalanceAccount> { return this._accounts; }
    public get generatedAt(): Date { return this._generatedAt; }
}
