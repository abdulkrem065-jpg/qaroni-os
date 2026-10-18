import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { FiscalCalendarId } from '../valueobjects/FiscalCalendarId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FiscalYear } from '../valueobjects/FiscalYear';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { FiscalYearCreatedEvent, FiscalPeriodOpenedEvent, FiscalPeriodClosedEvent } from '../events/SettingsEvents';

export class FiscalPeriod {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public status: 'OPEN' | 'CLOSED'
    ) {}
}

export class FiscalCalendar extends AggregateRoot<FiscalCalendarId> {
    private constructor(
        id: FiscalCalendarId,
        private _organizationId: OrganizationId,
        private _year: FiscalYear,
        private _periods: FiscalPeriod[],
        private _createdAt: Date
    ) {
        super(id);
    }

    public static create(id: FiscalCalendarId, organizationId: OrganizationId, year: FiscalYear, periods: FiscalPeriod[]): FiscalCalendar {
        // Validation: periods cannot overlap
        for (let i = 0; i < periods.length - 1; i++) {
            if (periods[i].endDate >= periods[i+1].startDate) {
                throw new BusinessRuleError('Fiscal periods cannot overlap');
            }
        }
        
        const f = new FiscalCalendar(id, organizationId, year, periods, new Date());
        f.addDomainEvent(new FiscalYearCreatedEvent(id.value, organizationId));
        return f;
    }

    public static load(id: FiscalCalendarId, organizationId: OrganizationId, year: FiscalYear, periods: FiscalPeriod[], createdAt: Date): FiscalCalendar {
        return new FiscalCalendar(id, organizationId, year, periods, createdAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get year(): FiscalYear { return this._year; }
    public get periods(): ReadonlyArray<FiscalPeriod> { return this._periods; }
    public get createdAt(): Date { return this._createdAt; }

    public openPeriod(periodId: string): void {
        const p = this._periods.find(x => x.id === periodId);
        if (!p) throw new BusinessRuleError('Period not found');
        if (p.status === 'CLOSED') {
            throw new BusinessRuleError('Cannot reopen a closed period');
        }
        if (p.status !== 'OPEN') {
            p.status = 'OPEN';
            this.addDomainEvent(new FiscalPeriodOpenedEvent(periodId, this._organizationId));
        }
    }

    public closePeriod(periodId: string): void {
        const p = this._periods.find(x => x.id === periodId);
        if (!p) throw new BusinessRuleError('Period not found');
        if (p.status === 'OPEN') {
            p.status = 'CLOSED';
            this.addDomainEvent(new FiscalPeriodClosedEvent(periodId, this._organizationId));
        }
    }
}
