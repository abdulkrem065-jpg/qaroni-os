import { Entity } from '../../shared/core/Entity';
import { AccountingPeriodId } from '../valueobjects/AccountingPeriodId';
import { PeriodStatus } from '../valueobjects/PeriodStatus';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class AccountingPeriod extends Entity<AccountingPeriodId> {
    private constructor(
        id: AccountingPeriodId,
        private _periodNumber: number,
        private _name: string,
        private _startDate: Date,
        private _endDate: Date,
        private _status: PeriodStatus
    ) {
        super(id);
    }

    public static create(
        id: AccountingPeriodId,
        periodNumber: number,
        name: string,
        startDate: Date,
        endDate: Date,
        status: PeriodStatus = new PeriodStatus('OPENING')
    ): AccountingPeriod {
        if (startDate > endDate) {
            throw new BusinessRuleError('Accounting period start date cannot be after end date');
        }
        return new AccountingPeriod(id, periodNumber, name, startDate, endDate, status);
    }

    public get periodNumber(): number { return this._periodNumber; }
    public get name(): string { return this._name; }
    public get startDate(): Date { return this._startDate; }
    public get endDate(): Date { return this._endDate; }
    public get status(): PeriodStatus { return this._status; }

    public containsDate(date: Date): boolean {
        // Strip time part for comparison
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const start = new Date(this._startDate.getFullYear(), this._startDate.getMonth(), this._startDate.getDate()).getTime();
        const end = new Date(this._endDate.getFullYear(), this._endDate.getMonth(), this._endDate.getDate()).getTime();
        return d >= start && d <= end;
    }

    public changeStatus(newStatus: PeriodStatus): { oldStatus: string, newStatus: string } {
        if (this._status.isArchived()) {
            throw new BusinessRuleError('Cannot change status of an archived period. Archived periods are immutable.');
        }
        const oldStatus = this._status.value;
        this._status = newStatus;
        return { oldStatus, newStatus: newStatus.value };
    }
}
