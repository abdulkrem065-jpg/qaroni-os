import { SupabaseClient } from '@supabase/supabase-js';
import { IPermissionRepository } from '../../../../domain/iam/repositories/IPermissionRepository';
import { Permission } from '../../../../domain/iam/entities/Permission';
import { PermissionId } from '../../../../domain/iam/value-objects/PermissionId';
import { OrganizationId } from '../../../../domain/iam/value-objects/OrganizationId';
import { RepositoryError } from '../../../errors/RepositoryError';

export class SupabasePermissionRepository implements IPermissionRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(record: any): Permission {
        try {
            return new Permission(
                new PermissionId(record.id),
                new OrganizationId(record.organization_id),
                record.name,
                record.action,
                record.resource
            );
        } catch (error) {
            throw new RepositoryError(`Failed to map Permission from persistence: ${error}`, error);
        }
    }

    private toPersistence(permission: Permission): any {
        return {
            id: permission.id.value,
            organization_id: permission.organizationId.value,
            name: permission.name,
            action: permission.action,
            resource: permission.resource,
        };
    }

    public async save(permission: Permission): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('permissions')
                .upsert(this.toPersistence(permission));

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to save Permission: ${error}`, error);
        }
    }

    
    public async exists(id: PermissionId | string): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('permissions')
                .select('id')
                .eq('id', (typeof id === 'string' ? id : id.value))
                .single();

            if (error) {
                if (error.code === 'PGRST116') return false;
                throw error;
            }
            return !!data;
        } catch (error) {
            throw new RepositoryError(`Failed to check Permission existence: ${error}`, error);
        }
    }

    public async findById(id: PermissionId | string): Promise<Permission | null> {
        try {
            const { data, error } = await this.supabase
                .from('permissions')
                .select('*')
                .eq('id', (typeof id === 'string' ? id : id.value))
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find Permission by id: ${error}`, error);
        }
    }

    public async findAll(organizationId: string): Promise<Permission[]> {
        try {
            const { data, error } = await this.supabase
                .from('permissions')
                .select('*')
                .eq('organization_id', organizationId);

            if (error) throw error;

            return data ? data.map(record => this.toDomain(record)) : [];
        } catch (error) {
            throw new RepositoryError(`Failed to find Permissions by organization: ${error}`, error);
        }
    }

    public async delete(id: PermissionId | string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('permissions')
                .delete()
                .eq('id', (typeof id === 'string' ? id : id.value));

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete Permission: ${error}`, error);
        }
    }
}
