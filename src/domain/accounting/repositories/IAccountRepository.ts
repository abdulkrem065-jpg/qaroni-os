import { Account } from '../aggregates/Account';
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
