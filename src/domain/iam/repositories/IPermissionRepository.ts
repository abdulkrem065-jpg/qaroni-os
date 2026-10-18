import { Permission } from '../entities/Permission';
import { PermissionId } from '../value-objects/PermissionId';

export interface IPermissionRepository {
    findById(id: PermissionId | string): Promise<Permission | null>;
    exists(id: PermissionId | string): Promise<boolean>;
    save(permission: Permission): Promise<void>;
    delete(id: PermissionId | string): Promise<void>;
    findAll(organizationId: string): Promise<Permission[]>;
}
