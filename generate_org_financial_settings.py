import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/settings/valueobjects/Country.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class Country {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('Country is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/TimeZone.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class TimeZone {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('TimeZone is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/Language.ts', """export class Language {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : 'en';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/DateFormat.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class DateFormat {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('DateFormat is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/NumberFormat.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class NumberFormat {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('NumberFormat is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/CurrencyFormat.ts', """export class CurrencyFormat {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '1,000.00';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/DecimalPrecision.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class DecimalPrecision {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0 || value > 6) throw new ValidationError('DecimalPrecision must be between 0 and 6');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/FinancialYearStart.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class FinancialYearStart {
    public readonly value: number;
    constructor(value: number) {
        if (value < 1 || value > 12) throw new ValidationError('FinancialYearStart must be a valid month (1-12)');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/settings/valueobjects/FinancialSettingsId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class FinancialSettingsId extends EntityId {}
""")

# Events
create_file('src/domain/settings/events/FinancialSettingsEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class FinancialSettingsUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
""")

# Aggregate
create_file('src/domain/settings/aggregates/OrganizationFinancialSettings.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { FinancialSettingsId } from '../valueobjects/FinancialSettingsId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { Country } from '../valueobjects/Country';
import { TimeZone } from '../valueobjects/TimeZone';
import { Language } from '../valueobjects/Language';
import { DateFormat } from '../valueobjects/DateFormat';
import { NumberFormat } from '../valueobjects/NumberFormat';
import { CurrencyFormat } from '../valueobjects/CurrencyFormat';
import { DecimalPrecision } from '../valueobjects/DecimalPrecision';
import { FinancialYearStart } from '../valueobjects/FinancialYearStart';
import { TaxProfileId } from '../valueobjects/TaxProfileId';
import { NumberSequenceId } from '../valueobjects/NumberSequenceId';
import { FinancialSettingsUpdatedEvent } from '../events/FinancialSettingsEvents';

export class OrganizationFinancialSettings extends AggregateRoot<FinancialSettingsId> {
    private constructor(
        id: FinancialSettingsId,
        private _organizationId: OrganizationId,
        private _country: Country,
        private _timeZone: TimeZone,
        private _defaultLanguage: Language,
        private _dateFormat: DateFormat,
        private _numberFormat: NumberFormat,
        private _currencyFormat: CurrencyFormat,
        private _decimalPrecision: DecimalPrecision,
        private _financialYearStart: FinancialYearStart,
        private _defaultTaxProfileId?: TaxProfileId,
        private _defaultNumberingProfileId?: NumberSequenceId
    ) {
        super(id);
    }

    public static create(
        id: FinancialSettingsId,
        organizationId: OrganizationId,
        country: Country,
        timeZone: TimeZone,
        defaultLanguage: Language,
        dateFormat: DateFormat,
        numberFormat: NumberFormat,
        currencyFormat: CurrencyFormat,
        decimalPrecision: DecimalPrecision,
        financialYearStart: FinancialYearStart,
        defaultTaxProfileId?: TaxProfileId,
        defaultNumberingProfileId?: NumberSequenceId
    ): OrganizationFinancialSettings {
        const settings = new OrganizationFinancialSettings(
            id, organizationId, country, timeZone, defaultLanguage, dateFormat, numberFormat, currencyFormat, decimalPrecision, financialYearStart, defaultTaxProfileId, defaultNumberingProfileId
        );
        settings.addDomainEvent(new FinancialSettingsUpdatedEvent(organizationId));
        return settings;
    }

    public static load(
        id: FinancialSettingsId,
        organizationId: OrganizationId,
        country: Country,
        timeZone: TimeZone,
        defaultLanguage: Language,
        dateFormat: DateFormat,
        numberFormat: NumberFormat,
        currencyFormat: CurrencyFormat,
        decimalPrecision: DecimalPrecision,
        financialYearStart: FinancialYearStart,
        defaultTaxProfileId?: TaxProfileId,
        defaultNumberingProfileId?: NumberSequenceId
    ): OrganizationFinancialSettings {
        return new OrganizationFinancialSettings(
            id, organizationId, country, timeZone, defaultLanguage, dateFormat, numberFormat, currencyFormat, decimalPrecision, financialYearStart, defaultTaxProfileId, defaultNumberingProfileId
        );
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get country(): Country { return this._country; }
    public get timeZone(): TimeZone { return this._timeZone; }
    public get defaultLanguage(): Language { return this._defaultLanguage; }
    public get dateFormat(): DateFormat { return this._dateFormat; }
    public get numberFormat(): NumberFormat { return this._numberFormat; }
    public get currencyFormat(): CurrencyFormat { return this._currencyFormat; }
    public get decimalPrecision(): DecimalPrecision { return this._decimalPrecision; }
    public get financialYearStart(): FinancialYearStart { return this._financialYearStart; }
    public get defaultTaxProfileId(): TaxProfileId | undefined { return this._defaultTaxProfileId; }
    public get defaultNumberingProfileId(): NumberSequenceId | undefined { return this._defaultNumberingProfileId; }

    public update(
        country: Country,
        timeZone: TimeZone,
        defaultLanguage: Language,
        dateFormat: DateFormat,
        numberFormat: NumberFormat,
        currencyFormat: CurrencyFormat,
        decimalPrecision: DecimalPrecision,
        financialYearStart: FinancialYearStart,
        defaultTaxProfileId?: TaxProfileId,
        defaultNumberingProfileId?: NumberSequenceId
    ): void {
        this._country = country;
        this._timeZone = timeZone;
        this._defaultLanguage = defaultLanguage;
        this._dateFormat = dateFormat;
        this._numberFormat = numberFormat;
        this._currencyFormat = currencyFormat;
        this._decimalPrecision = decimalPrecision;
        this._financialYearStart = financialYearStart;
        this._defaultTaxProfileId = defaultTaxProfileId;
        this._defaultNumberingProfileId = defaultNumberingProfileId;
        this.addDomainEvent(new FinancialSettingsUpdatedEvent(this._organizationId));
    }
}
""")

# Repository Interface
create_file('src/domain/settings/repositories/IOrganizationFinancialSettingsRepository.ts', """import { OrganizationFinancialSettings } from '../aggregates/OrganizationFinancialSettings';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IOrganizationFinancialSettingsRepository {
    save(settings: OrganizationFinancialSettings): Promise<void>;
    findByOrganization(organizationId: OrganizationId): Promise<OrganizationFinancialSettings | null>;
}
""")

print("General Financial Settings Domain generated")
