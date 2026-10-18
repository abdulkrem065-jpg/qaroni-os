import { IPermissionRepository } from '../../domain/iam/repositories/IPermissionRepository';
import { Role } from '../../domain/iam/aggregates/Role';
import { Permission } from '../../domain/iam/entities/Permission';

export class PermissionResolver {
    constructor(private permissionRepository: IPermissionRepository) {}

    public async resolveForRoles(roles: Role[]): Promise<Permission[]> {
        const permissionMap = new Map<string, Permission>();
        
        for (const role of roles) {
            for (const permissionId of role.permissionIds) {
                if (!permissionMap.has(permissionId.value)) {
                    const permission = await this.permissionRepository.findById(permissionId.value);
                    if (permission) {
                        permissionMap.set(permissionId.value, permission);
                    }
                }
            }
        }

        return Array.from(permissionMap.values());
    }
}
