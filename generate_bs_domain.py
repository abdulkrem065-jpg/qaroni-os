import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/BalanceSheetId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class BalanceSheetId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/BalanceSheetPeriod.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class BalanceSheetPeriod {
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('StartDate cannot be after EndDate');
        }
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AssetTotal.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AssetTotal {
    public readonly value: number;
    constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/LiabilityTotal.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class LiabilityTotal {
    public readonly value: number;
    constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/EquityTotal.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class EquityTotal {
    public readonly value: number;
    constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/BalanceSheetStatus.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type BalanceSheetStatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export class BalanceSheetStatus {
    public readonly value: BalanceSheetStatusType;
    constructor(value: string) {
        if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value)) {
            throw new ValidationError('Invalid BalanceSheetStatus');
        }
        this.value = value as BalanceSheetStatusType;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/BalanceSheetClassification.ts', """export type BalanceSheetMainSection = 'ASSETS' | 'LIABILITIES' | 'EQUITY';
export type BalanceSheetSubSection = 'CURRENT_ASSETS' | 'NON_CURRENT_ASSETS' | 'CURRENT_LIABILITIES' | 'LONG_TERM_LIABILITIES' | 'CAPITAL' | 'RETAINED_EARNINGS' | 'CURRENT_PROFIT' | 'RESERVES';
""")

# Entities
create_file('src/domain/accounting/entities/BalanceSheetLine.ts', """import { Entity } from '../../shared/core/Entity';
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
""")

create_file('src/domain/accounting/entities/BalanceSheetSection.ts', """import { Entity } from '../../shared/core/Entity';
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
""")

# Aggregates
create_file('src/domain/accounting/aggregates/BalanceSheet.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BalanceSheetPeriod } from '../valueobjects/BalanceSheetPeriod';
import { BalanceSheetStatus } from '../valueobjects/BalanceSheetStatus';
import { BalanceSheetSection } from '../entities/BalanceSheetSection';
import { AssetTotal } from '../valueobjects/AssetTotal';
import { LiabilityTotal } from '../valueobjects/LiabilityTotal';
import { EquityTotal } from '../valueobjects/EquityTotal';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';

export class BalanceSheet extends AggregateRoot<BalanceSheetId> {
    private constructor(
        id: BalanceSheetId,
        private readonly _organizationId: OrganizationId,
        private readonly _trialBalanceId: TrialBalanceId,
        private readonly _period: BalanceSheetPeriod,
        private _status: BalanceSheetStatus,
        private _sections: BalanceSheetSection[],
        private _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: BalanceSheetId,
        organizationId: OrganizationId,
        trialBalanceId: TrialBalanceId,
        period: BalanceSheetPeriod,
        sections: BalanceSheetSection[]
    ): BalanceSheet {
        const bs = new BalanceSheet(id, organizationId, trialBalanceId, period, new BalanceSheetStatus('DRAFT'), sections, new Date());
        bs.validateAccountingEquation();
        return bs;
    }

    public static load(
        id: BalanceSheetId,
        organizationId: OrganizationId,
        trialBalanceId: TrialBalanceId,
        period: BalanceSheetPeriod,
        status: BalanceSheetStatus,
        sections: BalanceSheetSection[],
        generatedAt: Date
    ): BalanceSheet {
        return new BalanceSheet(id, organizationId, trialBalanceId, period, status, sections, generatedAt);
    }

    public validateAccountingEquation(): void {
        const assets = this.calculateAssetTotal().value;
        const liabilities = this.calculateLiabilityTotal().value;
        const equity = this.calculateEquityTotal().value;

        // Assets = Liabilities + Equity
        // We assume precision up to 2 decimal places (cents)
        if (Math.abs(assets - (liabilities + equity)) > 0.001) {
            throw new BusinessRuleError(`Balance Sheet Imbalance Detected: Assets (${assets}) != Liabilities + Equity (${liabilities + equity})`);
        }
    }

    public calculateAssetTotal(): AssetTotal {
        const total = this._sections
            .filter(s => s.mainSection === 'ASSETS')
            .reduce((sum, s) => sum + s.total, 0);
        return new AssetTotal(total);
    }

    public calculateLiabilityTotal(): LiabilityTotal {
        const total = this._sections
            .filter(s => s.mainSection === 'LIABILITIES')
            .reduce((sum, s) => sum + s.total, 0);
        return new LiabilityTotal(total);
    }

    public calculateEquityTotal(): EquityTotal {
        const total = this._sections
            .filter(s => s.mainSection === 'EQUITY')
            .reduce((sum, s) => sum + s.total, 0);
        return new EquityTotal(total);
    }

    public publish(): void {
        if (this._status.value !== 'DRAFT') throw new BusinessRuleError('Only DRAFT balance sheets can be published');
        this.validateAccountingEquation();
        this._status = new BalanceSheetStatus('PUBLISHED');
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get trialBalanceId(): TrialBalanceId { return this._trialBalanceId; }
    public get period(): BalanceSheetPeriod { return this._period; }
    public get status(): BalanceSheetStatus { return this._status; }
    public get sections(): ReadonlyArray<BalanceSheetSection> { return this._sections; }
    public get generatedAt(): Date { return this._generatedAt; }
}
""")

print("Balance Sheet Domain generated")
