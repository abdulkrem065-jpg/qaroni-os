import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';

export class EquityStatementLineId extends EntityId {
    constructor(id: string) { super(id); }
}

export type EquityClassification = 'OPENING_BALANCE' | 'NET_INCOME' | 'DIVIDENDS' | 'CAPITAL_CONTRIBUTION' | 'PRIOR_PERIOD_ADJUSTMENT' | 'CLOSING_BALANCE';

export class EquityStatementLine extends Entity<EquityStatementLineId> {
    private constructor(
        id: EquityStatementLineId,
        public readonly classification: EquityClassification,
        public readonly description: string,
        public readonly amount: number
    ) {
        super(id);
    }

    public static create(
        id: EquityStatementLineId,
        classification: EquityClassification,
        description: string,
        amount: number
    ): EquityStatementLine {
        return new EquityStatementLine(id, classification, description, amount);
    }
}
