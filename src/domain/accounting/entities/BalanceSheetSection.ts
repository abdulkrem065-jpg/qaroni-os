import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { BalanceSheetMainSection, BalanceSheetSubSection } from '../valueobjects/BalanceSheetClassification';
import { BalanceSheetLine } from './BalanceSheetLine';

export class BalanceSheetSection extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _mainSection: BalanceSheetMainSection,
        private readonly _subSection: BalanceSheetSubSection,
        private _lines: BalanceSheetLine[],
        private _total: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        mainSection: BalanceSheetMainSection,
        subSection: BalanceSheetSubSection,
        lines: BalanceSheetLine[]
    ): BalanceSheetSection {
        const total = lines.reduce((sum, line) => sum + line.amount, 0);
        return new BalanceSheetSection(id, mainSection, subSection, lines, total);
    }

    public static load(
        id: EntityId,
        mainSection: BalanceSheetMainSection,
        subSection: BalanceSheetSubSection,
        lines: BalanceSheetLine[],
        total: number
    ): BalanceSheetSection {
        return new BalanceSheetSection(id, mainSection, subSection, lines, total);
    }

    public get mainSection(): BalanceSheetMainSection { return this._mainSection; }
    public get subSection(): BalanceSheetSubSection { return this._subSection; }
    public get lines(): ReadonlyArray<BalanceSheetLine> { return this._lines; }
    public get total(): number { return this._total; }
}
