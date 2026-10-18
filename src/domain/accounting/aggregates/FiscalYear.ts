import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { FiscalYearId } from '../valueobjects/FiscalYearId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FiscalYearStatus } from '../valueobjects/FiscalYearStatus';
import { AccountingPeriod } from '../entities/AccountingPeriod';
import { AccountingPeriodId } from '../valueobjects/AccountingPeriodId';
import { PeriodStatus } from '../valueobjects/PeriodStatus';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { FiscalYearCreatedEvent, FiscalYearClosedEvent, AccountingPeriodStatusChangedEvent, AccountingPeriodArchivedEvent } from '../events/FiscalPeriodEvents';

export class FiscalYear extends AggregateRoot<FiscalYearId> {
    private constructor(
        id: FiscalYearId,
        private readonly _organizationId: OrganizationId,
        private _year: number,
        private _startDate: Date,
        private _endDate: Date,
        private _status: FiscalYearStatus,
        private _periods: AccountingPeriod[]
    ) {
        super(id);
    }

    public static create(
        id: FiscalYearId,
        organizationId: OrganizationId,
        year: number,
        startDate: Date,
        endDate: Date,
        periods: AccountingPeriod[]
    ): FiscalYear {
        if (startDate > endDate) {
            throw new BusinessRuleError('Fiscal year start date cannot be after end date');
        }
        
        // Ensure periods cover the year continuously if needed, simplified here
        const fy = new FiscalYear(id, organizationId, year, startDate, endDate, new FiscalYearStatus('OPEN'), periods);
        fy.addDomainEvent(new FiscalYearCreatedEvent(organizationId, id));
        return fy;
    }

    public static load(
        id: FiscalYearId,
        organizationId: OrganizationId,
        year: number,
        startDate: Date,
        endDate: Date,
        status: FiscalYearStatus,
        periods: AccountingPeriod[]
    ): FiscalYear {
        return new FiscalYear(id, organizationId, year, startDate, endDate, status, periods);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get year(): number { return this._year; }
    public get startDate(): Date { return this._startDate; }
    public get endDate(): Date { return this._endDate; }
    public get status(): FiscalYearStatus { return this._status; }
    public get periods(): ReadonlyArray<AccountingPeriod> { return [...this._periods]; }

    public getPeriodForDate(date: Date): AccountingPeriod | undefined {
        return this._periods.find(p => p.containsDate(date));
    }

    public changePeriodStatus(periodId: AccountingPeriodId, newStatus: PeriodStatus): void {
        const period = this._periods.find(p => p.id.equals(periodId));
        if (!period) throw new BusinessRuleError('Accounting period not found in this fiscal year');

        if (this._status.value === 'CLOSED' && newStatus.value !== 'ARCHIVED') {
            throw new BusinessRuleError('Cannot reopen or modify periods in a closed fiscal year');
        }

        const result = period.changeStatus(newStatus);
        
        if (result.oldStatus !== result.newStatus) {
            this.addDomainEvent(new AccountingPeriodStatusChangedEvent(
                this._organizationId,
                periodId,
                result.oldStatus,
                result.newStatus
            ));
            
            if (newStatus.isArchived()) {
                this.addDomainEvent(new AccountingPeriodArchivedEvent(this._organizationId, periodId));
            }
        }
    }

    public close(): void {
        if (!this._status.isOpen()) {
            throw new BusinessRuleError('Fiscal year is already closed');
        }
        
        // Verify all periods are at least LOCKED or ARCHIVED before closing the year
        const hasOpenPeriods = this._periods.some(p => p.status.isOpening() || p.status.isClosing());
        if (hasOpenPeriods) {
            throw new BusinessRuleError('Cannot close fiscal year with OPENING or CLOSING periods');
        }

        this._status = new FiscalYearStatus('CLOSED');
        this.addDomainEvent(new FiscalYearClosedEvent(this._organizationId, this.id));
    }
}
