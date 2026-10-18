import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { IncomeStatementMainSection, IncomeStatementSubSection } from '../valueobjects/IncomeStatementClassification';
import { IncomeStatementLine } from './IncomeStatementLine';

export class IncomeStatementSection extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _mainSection: IncomeStatementMainSection,
        private readonly _subSection: IncomeStatementSubSection,
        private _lines: IncomeStatementLine[],
        private _total: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        mainSection: IncomeStatementMainSection,
        subSection: IncomeStatementSubSection,
        lines: IncomeStatementLine[]
    ): IncomeStatementSection {
        const total = lines.reduce((sum, line) => sum + line.amount, 0);
        return new IncomeStatementSection(id, mainSection, subSection, lines, total);
    }

    public static load(
        id: EntityId,
        mainSection: IncomeStatementMainSection,
        subSection: IncomeStatementSubSection,
        lines: IncomeStatementLine[],
        total: number
    ): IncomeStatementSection {
        return new IncomeStatementSection(id, mainSection, subSection, lines, total);
    }

    public get mainSection(): IncomeStatementMainSection { return this._mainSection; }
    public get subSection(): IncomeStatementSubSection { return this._subSection; }
    public get lines(): ReadonlyArray<IncomeStatementLine> { return this._lines; }
    public get total(): number { return this._total; }
}
