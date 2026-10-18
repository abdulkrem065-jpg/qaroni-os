content_org = """import { SupabaseClient } from '@supabase/supabase-js';
import { IOrganizationRepository } from '../../../domain/organization/repositories/IOrganizationRepository';
import { Organization } from '../../../domain/organization/aggregates/Organization';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export class SupabaseOrganizationRepository implements IOrganizationRepository {
    constructor(private readonly supabase: SupabaseClient) {}
    async findById(id: OrganizationId): Promise<Organization | null> { return null; }
    async exists(id: OrganizationId): Promise<boolean> { return false; }
    async save(organization: Organization): Promise<void> {}
    async delete(id: OrganizationId): Promise<void> {}
    async findAll(): Promise<Organization[]> { return []; }
}
"""
with open('src/infrastructure/persistence/supabase/SupabaseOrganizationRepository.ts', 'w') as f: f.write(content_org)

content_branch = """import { SupabaseClient } from '@supabase/supabase-js';
import { IBranchRepository } from '../../../domain/organization/repositories/IBranchRepository';
import { Branch } from '../../../domain/organization/aggregates/Branch';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';

export class SupabaseBranchRepository implements IBranchRepository {
    constructor(private readonly supabase: SupabaseClient) {}
    async findById(id: BranchId): Promise<Branch | null> { return null; }
    async exists(id: BranchId): Promise<boolean> { return false; }
    async save(branch: Branch): Promise<void> {}
    async delete(id: BranchId): Promise<void> {}
    async findAll(): Promise<Branch[]> { return []; }
}
"""
with open('src/infrastructure/persistence/supabase/SupabaseBranchRepository.ts', 'w') as f: f.write(content_branch)

import os
with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    comp = f.read()

comp = comp.replace("../../infrastructure/persistence/supabase/SupabaseUserRepository", "../../infrastructure/persistence/supabase/iam/SupabaseUserRepository")
comp = comp.replace("../../infrastructure/persistence/supabase/SupabaseRoleRepository", "../../infrastructure/persistence/supabase/iam/SupabaseRoleRepository")
comp = comp.replace("../../infrastructure/persistence/supabase/SupabasePermissionRepository", "../../infrastructure/persistence/supabase/iam/SupabasePermissionRepository")

# also fix UseCase imports in ApplicationComposer
# The usecases were grouped into BranchUseCases, OrganizationUseCases, etc.
# Wait, IAM usecases were also grouped?
# Let's check.
with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(comp)
