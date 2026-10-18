import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { CashFlowMainSection } from '../valueobjects/CashFlowClassification';
import { CashFlowLine } from './CashFlowLine';

export class CashFlowSection extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _mainSection: CashFlowMainSection,
        private _lines: CashFlowLine[],
        private _total: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        mainSection: CashFlowMainSection,
        lines: CashFlowLine[]
    ): CashFlowSection {
        const total = lines.reduce((sum, line) => sum + line.amount, 0);
        return new CashFlowSection(id, mainSection, lines, total);
    }

    public static load(
        id: EntityId,
        mainSection: CashFlowMainSection,
        lines: CashFlowLine[],
        total: number
    ): CashFlowSection {
        return new CashFlowSection(id, mainSection, lines, total);
    }

    public get mainSection(): CashFlowMainSection { return this._mainSection; }
    public get lines(): ReadonlyArray<CashFlowLine> { return this._lines; }
    public get total(): number { return this._total; }
}
