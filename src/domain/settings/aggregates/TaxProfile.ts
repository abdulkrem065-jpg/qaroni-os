import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
