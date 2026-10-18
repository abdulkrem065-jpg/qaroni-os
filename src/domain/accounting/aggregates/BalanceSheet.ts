import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
