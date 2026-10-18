import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountUseCases } from './AccountUseCases';
import { IAccountRepository } from '../../../domain/accounting/repositories/IAccountRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Account } from '../../../domain/accounting/aggregates/Account';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { AccountCode } from '../../../domain/accounting/valueobjects/AccountCode';
import { AccountName } from '../../../domain/accounting/valueobjects/AccountName';
import { AccountType } from '../../../domain/accounting/valueobjects/AccountType';
import { AccountCategory } from '../../../domain/accounting/valueobjects/AccountCategory';
import { NormalBalance } from '../../../domain/accounting/valueobjects/NormalBalance';
import { AccountLevel } from '../../../domain/accounting/valueobjects/AccountLevel';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

class TestAccountRepository implements IAccountRepository {
    public accounts: Map<string, Account> = new Map();

    async save(account: Account): Promise<void> {
        this.accounts.set(account.id.value, account);
    }
    async findById(id: AccountId, organizationId: OrganizationId): Promise<Account | null> {
        return this.accounts.get(id.value) || null;
    }
    async findByCode(code: AccountCode, organizationId: OrganizationId): Promise<Account | null> {
        for (const account of this.accounts.values()) {
            if (account.code.value === code.value && account.organizationId.value === organizationId.value) {
                return account;
            }
        }
        return null;
    }
    async findByOrganization(organizationId: OrganizationId): Promise<Account[]> {
        return Array.from(this.accounts.values()).filter(a => a.organizationId.value === organizationId.value);
    }
    async findChildren(parentId: AccountId, organizationId: OrganizationId): Promise<Account[]> {
        return Array.from(this.accounts.values()).filter(a => a.parentId?.value === parentId.value && a.organizationId.value === organizationId.value);
    }
}

class TestEventBus implements IEventBus {
    async publish(event: any): Promise<void> {}
    async publishAll(events: any[]): Promise<void> {}
}

describe('AccountUseCases', () => {
    let repo: TestAccountRepository;
    let eventBus: TestEventBus;
    let useCases: AccountUseCases;
    const orgId = crypto.randomUUID();

    beforeEach(() => {
        repo = new TestAccountRepository();
        eventBus = new TestEventBus();
        useCases = new AccountUseCases(repo, eventBus);
    });

    it('should create an account successfully', async () => {
        const result = await useCases.createAccount({
            organizationId: orgId,
            code: '1000',
            name: 'Cash',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: false
        });

        expect(result.code).toBe('1000');
        expect(repo.accounts.size).toBe(1);
    });

    it('should prevent duplicate account codes', async () => {
        await useCases.createAccount({
            organizationId: orgId,
            code: '1000',
            name: 'Cash',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: false
        });

        await expect(useCases.createAccount({
            organizationId: orgId,
            code: '1000',
            name: 'Another Cash',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: false
        })).rejects.toThrow(BusinessRuleError);
    });

    it('should allow header parent, prevent posting parent', async () => {
        const header = await useCases.createAccount({
            organizationId: orgId,
            code: '1000',
            name: 'Assets Header',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: true
        });

        const child = await useCases.createAccount({
            organizationId: orgId,
            code: '1100',
            name: 'Cash',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: false,
            parentId: header.id
        });

        expect(child.level).toBe(1);

        await expect(useCases.createAccount({
            organizationId: orgId,
            code: '1101',
            name: 'Petty Cash',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: false,
            parentId: child.id
        })).rejects.toThrow(/Posting accounts cannot contain children/);
    });
    
    it('should prevent circular reference during move', async () => {
        const header1 = await useCases.createAccount({
            organizationId: orgId,
            code: '1000',
            name: 'Assets Header',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: true
        });
        
        const header2 = await useCases.createAccount({
            organizationId: orgId,
            code: '2000',
            name: 'Current Assets Header',
            type: 'ASSET',
            category: 'CASH',
            normalBalance: 'DEBIT',
            isHeader: true,
            parentId: header1.id
        });
        
        // try to move header1 under header2
        await expect(useCases.moveAccount({
            organizationId: orgId,
            accountId: header1.id,
            newParentId: header2.id
        })).rejects.toThrow(/Circular reference detected/);
    });
});
