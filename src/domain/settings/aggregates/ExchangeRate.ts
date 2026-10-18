import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
