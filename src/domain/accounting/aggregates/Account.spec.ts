import { describe, it, expect } from 'vitest';
import { Account } from './Account';
import { AccountId } from '../valueobjects/AccountId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountCode } from '../valueobjects/AccountCode';
import { AccountName } from '../valueobjects/AccountName';
import { AccountType } from '../valueobjects/AccountType';
import { AccountCategory } from '../valueobjects/AccountCategory';
import { NormalBalance } from '../valueobjects/NormalBalance';
import { AccountLevel } from '../valueobjects/AccountLevel';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

describe('Account Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());

    it('should create a valid Account', () => {
        const account = Account.create(
            new AccountId(crypto.randomUUID()),
            orgId,
            new AccountCode('1000'),
            new AccountName('Cash'),
            new AccountType('ASSET'),
            new AccountCategory('CASH'),
            new NormalBalance('DEBIT'),
            false,
            new AccountLevel(0)
        );

        expect(account.code.value).toBe('1000');
        expect(account.status.isActive()).toBe(true);
        expect(account.domainEvents.length).toBe(1);
    });

    it('should update account name and category', () => {
        const account = Account.create(
            new AccountId(crypto.randomUUID()),
            orgId,
            new AccountCode('1000'),
            new AccountName('Cash'),
            new AccountType('ASSET'),
            new AccountCategory('CASH'),
            new NormalBalance('DEBIT'),
            false,
            new AccountLevel(0)
        );

        account.update(new AccountName('Petty Cash'), new AccountCategory('BANK'));
        expect(account.name.value).toBe('Petty Cash');
        expect(account.category.value).toBe('BANK');
    });

    it('should throw error when updating archived account', () => {
        const account = Account.create(
            new AccountId(crypto.randomUUID()),
            orgId,
            new AccountCode('1000'),
            new AccountName('Cash'),
            new AccountType('ASSET'),
            new AccountCategory('CASH'),
            new NormalBalance('DEBIT'),
            false,
            new AccountLevel(0)
        );

        account.archive();
        expect(() => account.update(new AccountName('Petty Cash'), new AccountCategory('BANK')))
            .toThrow(BusinessRuleError);
    });

    it('should restore an archived account', () => {
        const account = Account.create(
            new AccountId(crypto.randomUUID()),
            orgId,
            new AccountCode('1000'),
            new AccountName('Cash'),
            new AccountType('ASSET'),
            new AccountCategory('CASH'),
            new NormalBalance('DEBIT'),
            false,
            new AccountLevel(0)
        );

        account.archive();
        expect(account.status.isActive()).toBe(false);

        account.restore();
        expect(account.status.isActive()).toBe(true);
    });
});
