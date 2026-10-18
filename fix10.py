content = """import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { User } from '../../../../domain/iam/aggregates/User';
import { UserId } from '../../../../domain/iam/valueobjects/UserId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { EmailAddress } from '../../../../domain/shared/valueobjects/EmailAddress';
import { PersonName } from '../../../../domain/shared/valueobjects/PersonName';
import { RoleId } from '../../../../domain/iam/valueobjects/RoleId';
import { RepositoryError } from '../../../errors/RepositoryError';

export class SupabaseUserRepository implements IUserRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(record: any): User {
        try {
            const user = User.register(
                new UserId(record.id),
                new OrganizationId(record.organization_id),
                new EmailAddress(record.email),
                new PersonName(record.username || record.email.split('@')[0])
            );
            
            (user as any)._isActive = record.is_activated !== undefined ? record.is_activated : true;
            
            if (record.user_roles && Array.isArray(record.user_roles)) {
                (user as any)._roleIds = record.user_roles.map((ur: any) => new RoleId(ur.role_id));
            }
            return user;
        } catch (error) {
            throw new RepositoryError(`Failed to map User from persistence: ${error}`, error);
        }
    }

    private toPersistence(user: User): any {
        return {
            id: user.id.value,
            organization_id: user.organizationId.value,
            email: user.email.value,
            username: user.name.value,
            is_activated: user.isActive,
        };
    }

    public async save(user: User): Promise<void> {
        try {
            const { error: userError } = await this.supabase
                .from('users')
                .upsert(this.toPersistence(user));

            if (userError) throw userError;

            // Handle user_roles sync
            const currentRoles = user.roleIds.map(r => r.value);
            
            const { error: deleteError } = await this.supabase
                .from('user_roles')
                .delete()
                .eq('user_id', user.id.value);
                
            if (deleteError) throw deleteError;

            if (currentRoles.length > 0) {
                const roleRecords = currentRoles.map(roleId => ({
                    user_id: user.id.value,
                    role_id: roleId
                }));
                const { error: insertError } = await this.supabase
                    .from('user_roles')
                    .insert(roleRecords);
                    
                if (insertError) throw insertError;
            }
        } catch (error) {
            throw new RepositoryError(`Failed to save User: ${error}`, error);
        }
    }

    public async findById(id: UserId): Promise<User | null> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*, user_roles(role_id)')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find User by id: ${error}`, error);
        }
    }
    
    public async exists(id: UserId): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('id')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return false;
                throw error;
            }
            return !!data;
        } catch (error) {
            throw new RepositoryError(`Failed to check User existence: ${error}`, error);
        }
    }

    public async findByEmail(email: string): Promise<User | null> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*, user_roles(role_id)')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find User by email: ${error}`, error);
        }
    }

    public async findByUsername(username: string): Promise<User | null> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*, user_roles(role_id)')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find User by username: ${error}`, error);
        }
    }

    public async findAll(organizationId?: string): Promise<User[]> {
        try {
            let query = this.supabase.from('users').select('*, user_roles(role_id)');
            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }
            const { data, error } = await query;

            if (error) throw error;
            return data ? data.map(record => this.toDomain(record)) : [];
        } catch (error) {
            throw new RepositoryError(`Failed to find all Users: ${error}`, error);
        }
    }

    public async delete(id: UserId): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', id.value);

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete User: ${error}`, error);
        }
    }
}
"""
with open('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'w') as f:
    f.write(content)
