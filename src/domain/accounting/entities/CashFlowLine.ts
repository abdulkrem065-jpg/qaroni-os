import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';

export class CashFlowLine extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId | null, // null if it's a computed line like Net Income
        private readonly _description: string,
        private readonly _amount: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId | null,
        description: string,
        amount: number
    ): CashFlowLine {
        return new CashFlowLine(id, accountId, description, amount);
    }

    public static load(
        id: EntityId,
        accountId: AccountId | null,
        description: string,
        amount: number
    ): CashFlowLine {
        return new CashFlowLine(id, accountId, description, amount);
    }

    public get accountId(): AccountId | null { return this._accountId; }
    public get description(): string { return this._description; }
    public get amount(): number { return this._amount; }
}
