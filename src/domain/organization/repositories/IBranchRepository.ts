import { Branch } from '../aggregates/Branch';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchCode } from '../../shared/valueobjects/BranchCode';

export interface IBranchRepository {
    findById(id: BranchId): Promise<Branch | null>;
    findByOrganizationIdAndId(orgId: OrganizationId, branchId: BranchId): Promise<Branch | null>;
    findByOrganizationIdAndCode(orgId: OrganizationId, code: BranchCode): Promise<Branch | null>;
    findAllByOrganizationId(orgId: OrganizationId): Promise<Branch[]>;
    exists(id: BranchId): Promise<boolean>;
    save(branch: Branch): Promise<void>;
    delete(id: BranchId): Promise<void>;
}
