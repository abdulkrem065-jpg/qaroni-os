content = """import { SupabaseClient } from '@supabase/supabase-js';
import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { Role } from '../../../../domain/iam/aggregates/Role';
import { RoleId } from '../../../../domain/iam/valueobjects/RoleId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { PermissionId } from '../../../../domain/iam/valueobjects/PermissionId';
import { RepositoryError } from '../../../errors/RepositoryError';

export class SupabaseRoleRepository implements IRoleRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(record: any): Role {
        try {
            const role = Role.create(
                new RoleId(record.id),
                new OrganizationId(record.organization_id),
                record.name
            );
            
            if (record.role_permissions && Array.isArray(record.role_permissions)) {
                (role as any)._permissionIds = record.role_permissions.map((rp: any) => new PermissionId(rp.permission_id));
            }
            return role;
        } catch (error) {
            throw new RepositoryError(`Failed to map Role from persistence: ${error}`, error);
        }
    }

    private toPersistence(role: Role): any {
        return {
            id: role.id.value,
            organization_id: role.organizationId.value,
            name: role.name
        };
    }

    public async save(role: Role): Promise<void> {
        try {
            const { error: roleError } = await this.supabase
                .from('roles')
                .upsert(this.toPersistence(role));

            if (roleError) throw roleError;

            const currentPermissions = role.permissionIds.map(p => p.value);
            
            const { error: deleteError } = await this.supabase
                .from('role_permissions')
                .delete()
                .eq('role_id', role.id.value);
                
            if (deleteError) throw deleteError;

            if (currentPermissions.length > 0) {
                const permissionRecords = currentPermissions.map(permissionId => ({
                    role_id: role.id.value,
                    permission_id: permissionId
                }));
                const { error: insertError } = await this.supabase
                    .from('role_permissions')
                    .insert(permissionRecords);
                    
                if (insertError) throw insertError;
            }
        } catch (error) {
            throw new RepositoryError(`Failed to save Role: ${error}`, error);
        }
    }

    public async findById(id: RoleId): Promise<Role | null> {
        try {
            const { data, error } = await this.supabase
                .from('roles')
                .select('*, role_permissions(permission_id)')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find Role by id: ${error}`, error);
        }
    }
    
    public async exists(id: RoleId): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('roles')
                .select('id')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return false;
                throw error;
            }
            return !!data;
        } catch (error) {
            throw new RepositoryError(`Failed to check Role existence: ${error}`, error);
        }
    }

    public async findAll(organizationId?: string): Promise<Role[]> {
        try {
            let query = this.supabase.from('roles').select('*, role_permissions(permission_id)');
            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }
            const { data, error } = await query;

            if (error) throw error;
            return data ? data.map(record => this.toDomain(record)) : [];
        } catch (error) {
            throw new RepositoryError(`Failed to find all Roles: ${error}`, error);
        }
    }

    public async delete(id: RoleId): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('roles')
                .delete()
                .eq('id', id.value);

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete Role: ${error}`, error);
        }
    }
}
"""
with open('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'w') as f:
    f.write(content)
