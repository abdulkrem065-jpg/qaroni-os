import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { LedgerPeriod } from '../valueobjects/LedgerPeriod';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { LedgerBalanceUpdatedEvent } from '../events/GeneralLedgerEvents';

export class LedgerBalance extends AggregateRoot<LedgerBalanceId> {
    private constructor(
        id: LedgerBalanceId,
        private readonly _organizationId: OrganizationId,
        private readonly _accountId: AccountId,
        private readonly _period: LedgerPeriod,
        private _totalDebit: DebitAmount,
        private _totalCredit: CreditAmount,
        private _currencyId: string
    ) {
        super(id);
    }

    public static create(
        id: LedgerBalanceId,
        organizationId: OrganizationId,
        accountId: AccountId,
        period: LedgerPeriod,
        currencyId: string
    ): LedgerBalance {
        return new LedgerBalance(
            id, organizationId, accountId, period, new DebitAmount(0), new CreditAmount(0), currencyId
        );
    }

    public static load(
        id: LedgerBalanceId,
        organizationId: OrganizationId,
        accountId: AccountId,
        period: LedgerPeriod,
        totalDebit: DebitAmount,
        totalCredit: CreditAmount,
        currencyId: string
    ): LedgerBalance {
        return new LedgerBalance(id, organizationId, accountId, period, totalDebit, totalCredit, currencyId);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get accountId(): AccountId { return this._accountId; }
    public get period(): LedgerPeriod { return this._period; }
    public get totalDebit(): DebitAmount { return this._totalDebit; }
    public get totalCredit(): CreditAmount { return this._totalCredit; }
    public get currencyId(): string { return this._currencyId; }

    public addTransaction(debit: number, credit: number): void {
        this._totalDebit = new DebitAmount(this._totalDebit.value + debit);
        this._totalCredit = new CreditAmount(this._totalCredit.value + credit);
        this.addDomainEvent(new LedgerBalanceUpdatedEvent(this._organizationId, this.id));
    }
}
