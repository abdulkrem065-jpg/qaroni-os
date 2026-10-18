import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';

export class BalanceSheetLine extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId,
        private readonly _accountNumber: string,
        private readonly _accountName: string,
        private readonly _amount: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId,
        accountNumber: string,
        accountName: string,
        amount: number
    ): BalanceSheetLine {
        return new BalanceSheetLine(id, accountId, accountNumber, accountName, amount);
    }

    public static load(
        id: EntityId,
        accountId: AccountId,
        accountNumber: string,
        accountName: string,
        amount: number
    ): BalanceSheetLine {
        return new BalanceSheetLine(id, accountId, accountNumber, accountName, amount);
    }

    public get accountId(): AccountId { return this._accountId; }
    public get accountNumber(): string { return this._accountNumber; }
    public get accountName(): string { return this._accountName; }
    public get amount(): number { return this._amount; }
}
