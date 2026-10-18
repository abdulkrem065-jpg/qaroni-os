import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';
import { AccountBalance } from '../valueobjects/AccountBalance';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';

export class TrialBalanceAccount extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId,
        private readonly _balance: AccountBalance,
        private readonly _accountNumber: string,
        private readonly _accountName: string
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId,
        debit: number,
        credit: number,
        accountNumber: string,
        accountName: string
    ): TrialBalanceAccount {
        return new TrialBalanceAccount(
            id,
            accountId,
            new AccountBalance(new DebitAmount(debit), new CreditAmount(credit)),
            accountNumber,
            accountName
        );
    }

    public static load(
        id: EntityId,
        accountId: AccountId,
        debit: number,
        credit: number,
        accountNumber: string,
        accountName: string
    ): TrialBalanceAccount {
        return new TrialBalanceAccount(
            id,
            accountId,
            new AccountBalance(new DebitAmount(debit), new CreditAmount(credit)),
            accountNumber,
            accountName
        );
    }

    public get accountId(): AccountId { return this._accountId; }
    public get balance(): AccountBalance { return this._balance; }
    public get accountNumber(): string { return this._accountNumber; }
    public get accountName(): string { return this._accountName; }
}
