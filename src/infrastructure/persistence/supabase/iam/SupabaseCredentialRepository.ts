import { SupabaseClient } from '@supabase/supabase-js';
import { ICredentialRepository } from '../../../../domain/iam/repositories/ICredentialRepository';
import { Credential } from '../../../../domain/iam/entities/Credential';
import { CredentialId } from '../../../../domain/iam/value-objects/CredentialId';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { PasswordHash } from '../../../../domain/iam/value-objects/PasswordHash';
import { RepositoryError } from '../../../errors/RepositoryError';

export class SupabaseCredentialRepository implements ICredentialRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(record: any): Credential {
        try {
            return new Credential(
                new CredentialId(record.id),
                new UserId(record.user_id),
                new PasswordHash(record.password_hash),
                record.is_active
            );
        } catch (error) {
            throw new RepositoryError(`Failed to map Credential from persistence: ${error}`, error);
        }
    }

    private toPersistence(credential: Credential): any {
        return {
            id: credential.id.value,
            user_id: credential.userId.value,
            password_hash: credential.passwordHash.value,
            is_active: credential.isActive,
        };
    }

    public async save(credential: Credential): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('credentials')
                .upsert(this.toPersistence(credential));

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to save Credential: ${error}`, error);
        }
    }

    public async findByUserId(userId: string): Promise<Credential | null> {
        try {
            const { data, error } = await this.supabase
                .from('credentials')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find Credential by user id: ${error}`, error);
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('credentials')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete Credential: ${error}`, error);
        }
    }
}
