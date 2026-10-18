import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
