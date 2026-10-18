import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
