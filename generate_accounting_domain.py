import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/AccountId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class AccountId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/AccountCode.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('AccountCode cannot be empty');
        if (!/^[A-Za-z0-9-_.]+$/.test(value)) throw new ValidationError('AccountCode contains invalid characters');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountName.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountName {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('AccountName cannot be empty');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountType.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountType {
    public readonly value: string;
    constructor(value: string) {
        const standardTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
        if (!value || value.trim().length === 0) throw new ValidationError('AccountType cannot be empty');
        this.value = value.trim().toUpperCase();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountCategory.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountCategory {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('AccountCategory cannot be empty');
        this.value = value.trim().toUpperCase();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/NormalBalance.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type NormalBalanceType = 'DEBIT' | 'CREDIT';
export class NormalBalance {
    public readonly value: NormalBalanceType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        if (upper !== 'DEBIT' && upper !== 'CREDIT') throw new ValidationError('NormalBalance must be DEBIT or CREDIT');
        this.value = upper as NormalBalanceType;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/PostingStatus.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type PostingStatusType = 'ACTIVE' | 'ARCHIVED';
export class PostingStatus {
    public readonly value: PostingStatusType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        if (upper !== 'ACTIVE' && upper !== 'ARCHIVED') throw new ValidationError('PostingStatus must be ACTIVE or ARCHIVED');
        this.value = upper as PostingStatusType;
        Object.freeze(this);
    }
    
    public isActive(): boolean {
        return this.value === 'ACTIVE';
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountLevel.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountLevel {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0 || !Number.isInteger(value)) throw new ValidationError('AccountLevel must be a non-negative integer');
        this.value = value;
        Object.freeze(this);
    }
}
""")

# Events
create_file('src/domain/accounting/events/AccountEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';

export class AccountCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountArchivedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountRestoredEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountMovedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId, public readonly newParentId?: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
""")

# Aggregate
create_file('src/domain/accounting/aggregates/Account.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { AccountId } from '../valueobjects/AccountId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountCode } from '../valueobjects/AccountCode';
import { AccountName } from '../valueobjects/AccountName';
import { AccountType } from '../valueobjects/AccountType';
import { AccountCategory } from '../valueobjects/AccountCategory';
import { NormalBalance } from '../valueobjects/NormalBalance';
import { PostingStatus } from '../valueobjects/PostingStatus';
import { AccountLevel } from '../valueobjects/AccountLevel';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { AccountCreatedEvent, AccountUpdatedEvent, AccountArchivedEvent, AccountRestoredEvent, AccountMovedEvent } from '../events/AccountEvents';

export class Account extends AggregateRoot<AccountId> {
    private constructor(
        id: AccountId,
        private readonly _organizationId: OrganizationId,
        private _code: AccountCode,
        private _name: AccountName,
        private _type: AccountType,
        private _category: AccountCategory,
        private readonly _normalBalance: NormalBalance,
        private _status: PostingStatus,
        private _isHeader: boolean,
        private _level: AccountLevel,
        private _parentId?: AccountId
    ) {
        super(id);
    }

    public static create(
        id: AccountId,
        organizationId: OrganizationId,
        code: AccountCode,
        name: AccountName,
        type: AccountType,
        category: AccountCategory,
        normalBalance: NormalBalance,
        isHeader: boolean,
        level: AccountLevel,
        parentId?: AccountId
    ): Account {
        const account = new Account(
            id,
            organizationId,
            code,
            name,
            type,
            category,
            normalBalance,
            new PostingStatus('ACTIVE'),
            isHeader,
            level,
            parentId
        );
        account.addDomainEvent(new AccountCreatedEvent(organizationId, id));
        return account;
    }

    public static load(
        id: AccountId,
        organizationId: OrganizationId,
        code: AccountCode,
        name: AccountName,
        type: AccountType,
        category: AccountCategory,
        normalBalance: NormalBalance,
        status: PostingStatus,
        isHeader: boolean,
        level: AccountLevel,
        parentId?: AccountId
    ): Account {
        return new Account(
            id, organizationId, code, name, type, category, normalBalance, status, isHeader, level, parentId
        );
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get code(): AccountCode { return this._code; }
    public get name(): AccountName { return this._name; }
    public get type(): AccountType { return this._type; }
    public get category(): AccountCategory { return this._category; }
    public get normalBalance(): NormalBalance { return this._normalBalance; }
    public get status(): PostingStatus { return this._status; }
    public get isHeader(): boolean { return this._isHeader; }
    public get level(): AccountLevel { return this._level; }
    public get parentId(): AccountId | undefined { return this._parentId; }

    public update(name: AccountName, category: AccountCategory): void {
        this.checkArchived();
        this._name = name;
        this._category = category;
        this.addDomainEvent(new AccountUpdatedEvent(this._organizationId, this.id));
    }

    public archive(): void {
        if (!this._status.isActive()) throw new BusinessRuleError('Account is already archived');
        this._status = new PostingStatus('ARCHIVED');
        this.addDomainEvent(new AccountArchivedEvent(this._organizationId, this.id));
    }

    public restore(): void {
        if (this._status.isActive()) throw new BusinessRuleError('Account is already active');
        this._status = new PostingStatus('ACTIVE');
        this.addDomainEvent(new AccountRestoredEvent(this._organizationId, this.id));
    }

    public move(newParentId: AccountId | undefined, newLevel: AccountLevel): void {
        this.checkArchived();
        this._parentId = newParentId;
        this._level = newLevel;
        this.addDomainEvent(new AccountMovedEvent(this._organizationId, this.id, newParentId));
    }

    private checkArchived(): void {
        if (!this._status.isActive()) {
            throw new BusinessRuleError('Cannot modify an archived account');
        }
    }
}
""")

create_file('src/domain/accounting/repositories/IAccountRepository.ts', """import { Account } from '../aggregates/Account';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { AccountCode } from '../valueobjects/AccountCode';

export interface IAccountRepository {
    save(account: Account): Promise<void>;
    findById(id: AccountId, organizationId: OrganizationId): Promise<Account | null>;
    findByCode(code: AccountCode, organizationId: OrganizationId): Promise<Account | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Account[]>;
    findChildren(parentId: AccountId, organizationId: OrganizationId): Promise<Account[]>;
}
""")

print("Accounting domain generated")
