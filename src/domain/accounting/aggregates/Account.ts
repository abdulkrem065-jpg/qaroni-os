import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { AccountId } from '../valueobjects/AccountId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountCode } from '../valueobjects/AccountCode';
import { AccountName } from '../valueobjects/AccountName';
import { AccountType } from '../valueobjects/AccountType';
import { AccountCategory } from '../valueobjects/AccountCategory';
import { NormalBalance } from '../valueobjects/NormalBalance';
import { AccountStatus } from '../valueobjects/AccountStatus';
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
        private _status: AccountStatus,
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
            new AccountStatus('ACTIVE'),
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
        status: AccountStatus,
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
    public get status(): AccountStatus { return this._status; }
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
        this._status = new AccountStatus('ARCHIVED');
        this.addDomainEvent(new AccountArchivedEvent(this._organizationId, this.id));
    }

    public restore(): void {
        if (this._status.isActive()) throw new BusinessRuleError('Account is already active');
        this._status = new AccountStatus('ACTIVE');
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
