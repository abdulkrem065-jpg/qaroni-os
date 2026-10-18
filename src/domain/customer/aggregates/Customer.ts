import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { CustomerId } from '../valueobjects/CustomerId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CustomerCode } from '../valueobjects/CustomerCode';
import { CustomerName } from '../valueobjects/CustomerName';
import { CustomerPhone } from '../valueobjects/CustomerPhone';
import { CustomerEmail } from '../valueobjects/CustomerEmail';
import { CustomerAddress } from '../valueobjects/CustomerAddress';
import { CustomerStatus } from '../valueobjects/CustomerStatus';
import { CustomerCategory } from '../valueobjects/CustomerCategory';
import { CreditLimit } from '../valueobjects/CreditLimit';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    CustomerArchivedEvent,
    CustomerRestoredEvent,
    CustomerCreditLimitChangedEvent
} from '../events/CustomerEvents';

export class Customer extends AggregateRoot<CustomerId> {
    private _organizationId: OrganizationId;
    private _code: CustomerCode;
    private _name: CustomerName;
    private _phone?: CustomerPhone;
    private _email?: CustomerEmail;
    private _address?: CustomerAddress;
    private _status: CustomerStatus;
    private _category: CustomerCategory;
    private _creditLimit: CreditLimit;
    private _createdAt: Date;
    private _updatedAt: Date;

    private constructor(
        id: CustomerId,
        organizationId: OrganizationId,
        code: CustomerCode,
        name: CustomerName,
        phone: CustomerPhone | undefined,
        email: CustomerEmail | undefined,
        address: CustomerAddress | undefined,
        status: CustomerStatus,
        category: CustomerCategory,
        creditLimit: CreditLimit,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._code = code;
        this._name = name;
        this._phone = phone;
        this._email = email;
        this._address = address;
        this._status = status;
        this._category = category;
        this._creditLimit = creditLimit;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    public static create(
        id: CustomerId,
        organizationId: OrganizationId,
        code: CustomerCode,
        name: CustomerName,
        phone?: CustomerPhone,
        email?: CustomerEmail,
        address?: CustomerAddress,
        category?: CustomerCategory,
        creditLimit?: CreditLimit
    ): Customer {
        const customer = new Customer(
            id,
            organizationId,
            code,
            name,
            phone,
            email,
            address,
            new CustomerStatus('ACTIVE'),
            category || new CustomerCategory('REGULAR'),
            creditLimit || new CreditLimit(0),
            new Date(),
            new Date()
        );
        customer.addDomainEvent(new CustomerCreatedEvent(id, organizationId));
        return customer;
    }

    public static load(
        id: CustomerId,
        organizationId: OrganizationId,
        code: CustomerCode,
        name: CustomerName,
        phone: CustomerPhone | undefined,
        email: CustomerEmail | undefined,
        address: CustomerAddress | undefined,
        status: CustomerStatus,
        category: CustomerCategory,
        creditLimit: CreditLimit,
        createdAt: Date,
        updatedAt: Date
    ): Customer {
        return new Customer(
            id,
            organizationId,
            code,
            name,
            phone,
            email,
            address,
            status,
            category,
            creditLimit,
            createdAt,
            updatedAt
        );
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get code(): CustomerCode { return this._code; }
    public get name(): CustomerName { return this._name; }
    public get phone(): CustomerPhone | undefined { return this._phone; }
    public get email(): CustomerEmail | undefined { return this._email; }
    public get address(): CustomerAddress | undefined { return this._address; }
    public get status(): CustomerStatus { return this._status; }
    public get category(): CustomerCategory { return this._category; }
    public get creditLimit(): CreditLimit { return this._creditLimit; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    public update(
        name: CustomerName,
        phone?: CustomerPhone,
        email?: CustomerEmail,
        address?: CustomerAddress,
        category?: CustomerCategory
    ): void {
        if (this._status.value === 'ARCHIVED') {
            throw new BusinessRuleError('Cannot modify an archived customer');
        }

        this._name = name;
        this._phone = phone;
        this._email = email;
        this._address = address;
        if (category) {
            this._category = category;
        }
        this._updatedAt = new Date();

        this.addDomainEvent(new CustomerUpdatedEvent(this.id, this._organizationId));
    }

    public changeCreditLimit(newLimit: CreditLimit): void {
        if (this._status.value === 'ARCHIVED') {
            throw new BusinessRuleError('Cannot modify an archived customer');
        }

        const oldLimit = this._creditLimit;
        this._creditLimit = newLimit;
        this._updatedAt = new Date();

        this.addDomainEvent(new CustomerCreditLimitChangedEvent(this.id, this._organizationId, oldLimit, newLimit));
    }

    public archive(): void {
        if (this._status.value === 'ARCHIVED') {
            return;
        }
        this._status = new CustomerStatus('ARCHIVED');
        this._updatedAt = new Date();
        this.addDomainEvent(new CustomerArchivedEvent(this.id, this._organizationId));
    }

    public restore(): void {
        if (this._status.value === 'ACTIVE') {
            return;
        }
        this._status = new CustomerStatus('ACTIVE');
        this._updatedAt = new Date();
        this.addDomainEvent(new CustomerRestoredEvent(this.id, this._organizationId));
    }
}
