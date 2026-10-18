import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TaxId } from '../../shared/valueobjects/TaxId';
import { Timezone } from '../../shared/valueobjects/Timezone';
import { Currency } from '../../shared/valueobjects/Currency';
import { ValidationError } from '../../shared/errors/ValidationError';
import { OrganizationCreatedEvent } from '../events/OrganizationCreatedEvent';
import { OrganizationDeactivatedEvent } from '../events/OrganizationDeactivatedEvent';
import { OrganizationSettingsUpdatedEvent } from '../events/OrganizationSettingsUpdatedEvent';

export class Organization extends AggregateRoot<OrganizationId> {
    private _name: string;
    private _taxId?: TaxId;
    private _timezone?: Timezone;
    private _currency?: Currency;
    private _isActive: boolean;

    private constructor(
        id: OrganizationId, 
        name: string, 
        isActive: boolean,
        taxId?: TaxId,
        timezone?: Timezone,
        currency?: Currency
    ) {
        super(id);
        this._name = name;
        this._isActive = isActive;
        this._taxId = taxId;
        this._timezone = timezone;
        this._currency = currency;
    }

    public static create(id: OrganizationId, name: string): Organization {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Organization name cannot be empty');
        }
        const organization = new Organization(id, name.trim(), true);
        organization.addDomainEvent(new OrganizationCreatedEvent(id, name.trim()));
        return organization;
    }

    public static reconstitute(
        id: OrganizationId,
        name: string,
        isActive: boolean,
        taxId?: TaxId,
        timezone?: Timezone,
        currency?: Currency
    ): Organization {
        return new Organization(id, name, isActive, taxId, timezone, currency);
    }

    public updateSettings(taxId?: TaxId, timezone?: Timezone, currency?: Currency): void {
        if (!this._isActive) {
            throw new ValidationError('Cannot update settings for inactive organization');
        }
        this._taxId = taxId;
        this._timezone = timezone;
        this._currency = currency;

        this.addDomainEvent(new OrganizationSettingsUpdatedEvent(
            this.id,
            this._taxId?.value,
            this._timezone?.value,
            this._currency?.code
        ));
    }

    public deactivate(): void {
        if (!this._isActive) {
            throw new ValidationError('Organization is already inactive');
        }
        this._isActive = false;
        this.addDomainEvent(new OrganizationDeactivatedEvent(this.id));
    }

    public get name(): string {
        return this._name;
    }

    public get taxId(): TaxId | undefined {
        return this._taxId;
    }

    public get timezone(): Timezone | undefined {
        return this._timezone;
    }

    public get currency(): Currency | undefined {
        return this._currency;
    }

    public get isActive(): boolean {
        return this._isActive;
    }
}
