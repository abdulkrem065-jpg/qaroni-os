import { Role } from '../aggregates/Role';
import { RoleId } from '../valueobjects/RoleId';

export interface IRoleRepository {
    findById(id: RoleId | string): Promise<Role | null>;
    exists(id: RoleId | string): Promise<boolean>;
    save(role: Role): Promise<void>;
    delete(id: RoleId | string): Promise<void>;
    findAll(organizationId?: string): Promise<Role[]>;
}
