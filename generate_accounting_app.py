import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# DTOs
create_file('src/application/accounting/dtos/AccountDTOs.ts', """export interface CreateAccountDTO {
    organizationId: string;
    code: string;
    name: string;
    type: string;
    category: string;
    normalBalance: string;
    isHeader: boolean;
    parentId?: string;
}

export interface UpdateAccountDTO {
    organizationId: string;
    accountId: string;
    name: string;
    category: string;
}

export interface MoveAccountDTO {
    organizationId: string;
    accountId: string;
    newParentId?: string;
}

export interface AccountResponseDTO {
    id: string;
    organizationId: string;
    code: string;
    name: string;
    type: string;
    category: string;
    normalBalance: string;
    status: string;
    isHeader: boolean;
    level: number;
    parentId?: string;
}
""")

# Use Cases
create_file('src/application/accounting/usecases/AccountUseCases.ts', """import { IAccountRepository } from '../../../domain/accounting/repositories/IAccountRepository';
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
import { CreateAccountDTO, UpdateAccountDTO, MoveAccountDTO, AccountResponseDTO } from '../dtos/AccountDTOs';

export class AccountUseCases {
    constructor(
        private readonly accountRepo: IAccountRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createAccount(dto: CreateAccountDTO): Promise<AccountResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const code = new AccountCode(dto.code);

        const existing = await this.accountRepo.findByCode(code, orgId);
        if (existing) {
            throw new BusinessRuleError('Account code must be unique within the organization');
        }

        let level = 0;
        let parentId: AccountId | undefined;

        if (dto.parentId) {
            parentId = new AccountId(dto.parentId);
            const parent = await this.accountRepo.findById(parentId, orgId);
            if (!parent) {
                throw new BusinessRuleError('Parent account not found');
            }
            if (!parent.isHeader) {
                throw new BusinessRuleError('Posting accounts cannot contain children');
            }
            level = parent.level.value + 1;
        }

        const account = Account.create(
            new AccountId(crypto.randomUUID()),
            orgId,
            code,
            new AccountName(dto.name),
            new AccountType(dto.type),
            new AccountCategory(dto.category),
            new NormalBalance(dto.normalBalance),
            dto.isHeader,
            new AccountLevel(level),
            parentId
        );

        await this.accountRepo.save(account);

        for (const ev of account.domainEvents) await this.eventBus.publish(ev);
        account.clearDomainEvents();

        return this.mapToDTO(account);
    }

    public async updateAccount(dto: UpdateAccountDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const account = await this.accountRepo.findById(new AccountId(dto.accountId), orgId);
        
        if (!account) throw new BusinessRuleError('Account not found');

        account.update(new AccountName(dto.name), new AccountCategory(dto.category));
        
        await this.accountRepo.save(account);

        for (const ev of account.domainEvents) await this.eventBus.publish(ev);
        account.clearDomainEvents();
    }

    public async archiveAccount(organizationId: string, accountId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const id = new AccountId(accountId);
        const account = await this.accountRepo.findById(id, orgId);
        
        if (!account) throw new BusinessRuleError('Account not found');

        account.archive();
        await this.accountRepo.save(account);

        for (const ev of account.domainEvents) await this.eventBus.publish(ev);
        account.clearDomainEvents();
    }

    public async restoreAccount(organizationId: string, accountId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const id = new AccountId(accountId);
        const account = await this.accountRepo.findById(id, orgId);
        
        if (!account) throw new BusinessRuleError('Account not found');

        account.restore();
        await this.accountRepo.save(account);

        for (const ev of account.domainEvents) await this.eventBus.publish(ev);
        account.clearDomainEvents();
    }

    public async moveAccount(dto: MoveAccountDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const account = await this.accountRepo.findById(new AccountId(dto.accountId), orgId);
        
        if (!account) throw new BusinessRuleError('Account not found');

        let level = 0;
        let newParentId: AccountId | undefined;

        if (dto.newParentId) {
            if (dto.accountId === dto.newParentId) {
                throw new BusinessRuleError('Account cannot be its own parent');
            }
            newParentId = new AccountId(dto.newParentId);
            const parent = await this.accountRepo.findById(newParentId, orgId);
            if (!parent) {
                throw new BusinessRuleError('Parent account not found');
            }
            if (!parent.isHeader) {
                throw new BusinessRuleError('Posting accounts cannot contain children');
            }
            
            // Cycle detection (traverse up)
            let currentParentId = parent.parentId;
            while (currentParentId) {
                if (currentParentId.value === account.id.value) {
                    throw new BusinessRuleError('Circular reference detected');
                }
                const ancestor = await this.accountRepo.findById(currentParentId, orgId);
                currentParentId = ancestor?.parentId;
            }

            level = parent.level.value + 1;
        }

        account.move(newParentId, new AccountLevel(level));
        await this.accountRepo.save(account);

        // We also need to update levels of all children recursively. 
        // For simplicity and adherence to standard DDD, an event handler should ideally handle cascading updates, 
        // or we load and update the aggregate subtree here. 
        // Given the requirement, we must ensure correct hierarchy depth. 
        await this.updateChildrenLevels(account, orgId);

        for (const ev of account.domainEvents) await this.eventBus.publish(ev);
        account.clearDomainEvents();
    }

    private async updateChildrenLevels(parentAccount: Account, orgId: OrganizationId): Promise<void> {
        const children = await this.accountRepo.findChildren(parentAccount.id, orgId);
        for (const child of children) {
            child.move(parentAccount.id, new AccountLevel(parentAccount.level.value + 1));
            await this.accountRepo.save(child);
            await this.updateChildrenLevels(child, orgId);
        }
    }

    public async getAccount(organizationId: string, accountId: string): Promise<AccountResponseDTO | null> {
        const orgId = new OrganizationId(organizationId);
        const account = await this.accountRepo.findById(new AccountId(accountId), orgId);
        if (!account) return null;
        return this.mapToDTO(account);
    }

    public async listAccounts(organizationId: string): Promise<AccountResponseDTO[]> {
        const orgId = new OrganizationId(organizationId);
        const accounts = await this.accountRepo.findByOrganization(orgId);
        return accounts.map(a => this.mapToDTO(a));
    }
    
    public async validateChartStructure(organizationId: string): Promise<{ valid: boolean, errors: string[] }> {
        // Placeholder for structural validation if needed beyond active invariants
        // This could check for orphaned accounts, or invalid types mapped to categories.
        const errors: string[] = [];
        return { valid: errors.length === 0, errors };
    }

    private mapToDTO(account: Account): AccountResponseDTO {
        return {
            id: account.id.value,
            organizationId: account.organizationId.value,
            code: account.code.value,
            name: account.name.value,
            type: account.type.value,
            category: account.category.value,
            normalBalance: account.normalBalance.value,
            status: account.status.value,
            isHeader: account.isHeader,
            level: account.level.value,
            parentId: account.parentId?.value
        };
    }
}
""")

print("Accounting App layer generated")
