import re

content = """import { Permission } from '../entities/Permission';
import { PermissionId } from '../value-objects/PermissionId';

export interface IPermissionRepository {
    findById(id: PermissionId): Promise<Permission | null>;
    exists(id: PermissionId): Promise<boolean>;
    save(permission: Permission): Promise<void>;
    delete(id: PermissionId): Promise<void>;
    findAll(organizationId: string): Promise<Permission[]>;
}
"""

with open('src/domain/iam/repositories/IPermissionRepository.ts', 'w') as f:
    f.write(content)

