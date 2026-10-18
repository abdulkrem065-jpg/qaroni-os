import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/settings/valueobjects/CurrencyId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class CurrencyId extends EntityId {}
""")

create_file('src/domain/settings/valueobjects/CurrencyCode.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class CurrencyCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length !== 3) {
            throw new ValidationError('CurrencyCode must be exactly 3 characters (ISO 4217)');
        }
        this.value = value.trim().toUpperCase();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/CurrencySymbol.ts', """export class CurrencySymbol {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/ExchangeRateValue.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class ExchangeRateValue {
    public readonly value: number;
    constructor(value: number) {
        if (value <= 0) {
            throw new ValidationError('ExchangeRateValue must be greater than 0');
        }
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/TaxRate.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class TaxRate {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) {
            throw new ValidationError('TaxRate cannot be negative');
        }
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/FiscalYear.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class FiscalYear {
    public readonly value: number;
    constructor(value: number) {
        if (value < 1900 || value > 2100) {
            throw new ValidationError('FiscalYear is out of bounds');
        }
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/FiscalPeriodId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class FiscalPeriodId extends EntityId {}
""")

create_file('src/domain/settings/valueobjects/SequencePrefix.ts', """export class SequencePrefix {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/SequencePattern.ts', """export class SequencePattern {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '####';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/ExchangeRateId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class ExchangeRateId extends EntityId {}
""")

create_file('src/domain/settings/valueobjects/TaxProfileId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class TaxProfileId extends EntityId {}
""")

create_file('src/domain/settings/valueobjects/NumberSequenceId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class NumberSequenceId extends EntityId {}
""")

create_file('src/domain/settings/valueobjects/FiscalCalendarId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class FiscalCalendarId extends EntityId {}
""")

# Events
create_file('src/domain/settings/events/SettingsEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class CurrencyCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CurrencyUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class BaseCurrencyChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly newCurrencyId: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class ExchangeRateCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalYearCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalPeriodOpenedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly periodId: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalPeriodClosedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly periodId: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class TaxProfileCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class NumberSequenceCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class NumberGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId, public readonly value: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
""")

# Aggregates
create_file('src/domain/settings/aggregates/Currency.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { CurrencyId } from '../valueobjects/CurrencyId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyCode } from '../valueobjects/CurrencyCode';
import { CurrencySymbol } from '../valueobjects/CurrencySymbol';
import { CurrencyCreatedEvent, CurrencyUpdatedEvent, BaseCurrencyChangedEvent } from '../events/SettingsEvents';

export class Currency extends AggregateRoot<CurrencyId> {
    private constructor(
        id: CurrencyId,
        private _organizationId: OrganizationId,
        private _code: CurrencyCode,
        private _symbol: CurrencySymbol,
        private _isBase: boolean,
        private _createdAt: Date,
        private _updatedAt: Date
    ) {
        super(id);
    }

    public static create(id: CurrencyId, organizationId: OrganizationId, code: CurrencyCode, symbol: CurrencySymbol, isBase: boolean = false): Currency {
        const c = new Currency(id, organizationId, code, symbol, isBase, new Date(), new Date());
        c.addDomainEvent(new CurrencyCreatedEvent(id.value, organizationId));
        return c;
    }

    public static load(id: CurrencyId, organizationId: OrganizationId, code: CurrencyCode, symbol: CurrencySymbol, isBase: boolean, createdAt: Date, updatedAt: Date): Currency {
        return new Currency(id, organizationId, code, symbol, isBase, createdAt, updatedAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get code(): CurrencyCode { return this._code; }
    public get symbol(): CurrencySymbol { return this._symbol; }
    public get isBase(): boolean { return this._isBase; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    public update(symbol: CurrencySymbol): void {
        this._symbol = symbol;
        this._updatedAt = new Date();
        this.addDomainEvent(new CurrencyUpdatedEvent(this.id.value, this._organizationId));
    }

    public setAsBase(): void {
        if (!this._isBase) {
            this._isBase = true;
            this._updatedAt = new Date();
            this.addDomainEvent(new BaseCurrencyChangedEvent(this._organizationId, this.id.value));
        }
    }
    
    public clearBase(): void {
        this._isBase = false;
        this._updatedAt = new Date();
    }
}
""")

create_file('src/domain/settings/aggregates/ExchangeRate.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { ExchangeRateId } from '../valueobjects/ExchangeRateId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyId } from '../valueobjects/CurrencyId';
import { ExchangeRateValue } from '../valueobjects/ExchangeRateValue';
import { ExchangeRateCreatedEvent } from '../events/SettingsEvents';

export class ExchangeRate extends AggregateRoot<ExchangeRateId> {
    private constructor(
        id: ExchangeRateId,
        private _organizationId: OrganizationId,
        private _fromCurrencyId: CurrencyId,
        private _toCurrencyId: CurrencyId,
        private _rate: ExchangeRateValue,
        private _effectiveDate: Date,
        private _createdAt: Date
    ) {
        super(id);
    }

    public static create(id: ExchangeRateId, organizationId: OrganizationId, fromCurrencyId: CurrencyId, toCurrencyId: CurrencyId, rate: ExchangeRateValue, effectiveDate: Date): ExchangeRate {
        const e = new ExchangeRate(id, organizationId, fromCurrencyId, toCurrencyId, rate, effectiveDate, new Date());
        e.addDomainEvent(new ExchangeRateCreatedEvent(id.value, organizationId));
        return e;
    }

    public static load(id: ExchangeRateId, organizationId: OrganizationId, fromCurrencyId: CurrencyId, toCurrencyId: CurrencyId, rate: ExchangeRateValue, effectiveDate: Date, createdAt: Date): ExchangeRate {
        return new ExchangeRate(id, organizationId, fromCurrencyId, toCurrencyId, rate, effectiveDate, createdAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get fromCurrencyId(): CurrencyId { return this._fromCurrencyId; }
    public get toCurrencyId(): CurrencyId { return this._toCurrencyId; }
    public get rate(): ExchangeRateValue { return this._rate; }
    public get effectiveDate(): Date { return this._effectiveDate; }
    public get createdAt(): Date { return this._createdAt; }
}
""")

create_file('src/domain/settings/aggregates/FiscalCalendar.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
""")

create_file('src/domain/settings/aggregates/TaxProfile.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { TaxProfileId } from '../valueobjects/TaxProfileId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TaxRate } from '../valueobjects/TaxRate';
import { TaxProfileCreatedEvent } from '../events/SettingsEvents';

export class TaxProfile extends AggregateRoot<TaxProfileId> {
    private constructor(
        id: TaxProfileId,
        private _organizationId: OrganizationId,
        private _name: string,
        private _rate: TaxRate,
        private _isActive: boolean,
        private _createdAt: Date
    ) {
        super(id);
    }

    public static create(id: TaxProfileId, organizationId: OrganizationId, name: string, rate: TaxRate): TaxProfile {
        const t = new TaxProfile(id, organizationId, name, rate, true, new Date());
        t.addDomainEvent(new TaxProfileCreatedEvent(id.value, organizationId));
        return t;
    }

    public static load(id: TaxProfileId, organizationId: OrganizationId, name: string, rate: TaxRate, isActive: boolean, createdAt: Date): TaxProfile {
        return new TaxProfile(id, organizationId, name, rate, isActive, createdAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get name(): string { return this._name; }
    public get rate(): TaxRate { return this._rate; }
    public get isActive(): boolean { return this._isActive; }
    public get createdAt(): Date { return this._createdAt; }

    public update(name: string, rate: TaxRate, isActive: boolean): void {
        this._name = name;
        this._rate = rate;
        this._isActive = isActive;
    }
}
""")

create_file('src/domain/settings/aggregates/NumberSequence.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { NumberSequenceId } from '../valueobjects/NumberSequenceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { SequencePrefix } from '../valueobjects/SequencePrefix';
import { SequencePattern } from '../valueobjects/SequencePattern';
import { NumberSequenceCreatedEvent, NumberGeneratedEvent } from '../events/SettingsEvents';

export class NumberSequence extends AggregateRoot<NumberSequenceId> {
    private constructor(
        id: NumberSequenceId,
        private _organizationId: OrganizationId,
        private _entityType: string,
        private _prefix: SequencePrefix,
        private _pattern: SequencePattern,
        private _currentValue: number,
        private _createdAt: Date
    ) {
        super(id);
    }

    public static create(id: NumberSequenceId, organizationId: OrganizationId, entityType: string, prefix: SequencePrefix, pattern: SequencePattern): NumberSequence {
        const s = new NumberSequence(id, organizationId, entityType, prefix, pattern, 0, new Date());
        s.addDomainEvent(new NumberSequenceCreatedEvent(id.value, organizationId));
        return s;
    }

    public static load(id: NumberSequenceId, organizationId: OrganizationId, entityType: string, prefix: SequencePrefix, pattern: SequencePattern, currentValue: number, createdAt: Date): NumberSequence {
        return new NumberSequence(id, organizationId, entityType, prefix, pattern, currentValue, createdAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get entityType(): string { return this._entityType; }
    public get prefix(): SequencePrefix { return this._prefix; }
    public get pattern(): SequencePattern { return this._pattern; }
    public get currentValue(): number { return this._currentValue; }
    public get createdAt(): Date { return this._createdAt; }

    public generateNext(): string {
        this._currentValue += 1;
        const valStr = this._currentValue.toString();
        // naive pattern replacement for '#'
        const padLen = (this._pattern.value.match(/#/g) || []).length;
        const paddedVal = valStr.padStart(padLen, '0');
        const result = `${this._prefix.value}${paddedVal}`;
        
        this.addDomainEvent(new NumberGeneratedEvent(this.id.value, this._organizationId, result));
        return result;
    }
}
""")

# Repositories
create_file('src/domain/settings/repositories/ICurrencyRepository.ts', """import { Currency } from '../aggregates/Currency';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyId } from '../valueobjects/CurrencyId';

export interface ICurrencyRepository {
    save(currency: Currency): Promise<void>;
    findById(id: CurrencyId, organizationId: OrganizationId): Promise<Currency | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Currency[]>;
    getBaseCurrency(organizationId: OrganizationId): Promise<Currency | null>;
}
""")

create_file('src/domain/settings/repositories/IExchangeRateRepository.ts', """import { ExchangeRate } from '../aggregates/ExchangeRate';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyId } from '../valueobjects/CurrencyId';

export interface IExchangeRateRepository {
    save(exchangeRate: ExchangeRate): Promise<void>;
    getLatestRate(organizationId: OrganizationId, fromCurrencyId: CurrencyId, toCurrencyId: CurrencyId): Promise<ExchangeRate | null>;
    findByOrganization(organizationId: OrganizationId): Promise<ExchangeRate[]>;
}
""")

create_file('src/domain/settings/repositories/IFiscalRepository.ts', """import { FiscalCalendar } from '../aggregates/FiscalCalendar';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FiscalYear } from '../valueobjects/FiscalYear';

export interface IFiscalRepository {
    save(calendar: FiscalCalendar): Promise<void>;
    findByYear(organizationId: OrganizationId, year: FiscalYear): Promise<FiscalCalendar | null>;
    findByOrganization(organizationId: OrganizationId): Promise<FiscalCalendar[]>;
}
""")

create_file('src/domain/settings/repositories/ITaxRepository.ts', """import { TaxProfile } from '../aggregates/TaxProfile';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TaxProfileId } from '../valueobjects/TaxProfileId';

export interface ITaxRepository {
    save(tax: TaxProfile): Promise<void>;
    findById(id: TaxProfileId, organizationId: OrganizationId): Promise<TaxProfile | null>;
    findByOrganization(organizationId: OrganizationId): Promise<TaxProfile[]>;
}
""")

create_file('src/domain/settings/repositories/INumberSequenceRepository.ts', """import { NumberSequence } from '../aggregates/NumberSequence';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface INumberSequenceRepository {
    save(sequence: NumberSequence): Promise<void>;
    findByEntityType(organizationId: OrganizationId, entityType: string): Promise<NumberSequence | null>;
}
""")

print("Settings domain generated")
