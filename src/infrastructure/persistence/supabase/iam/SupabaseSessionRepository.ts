import { SupabaseClient } from '@supabase/supabase-js';
import { ISessionRepository } from '../../../../domain/iam/repositories/ISessionRepository';
import { Session } from '../../../../domain/iam/entities/Session';
import { SessionId } from '../../../../domain/iam/value-objects/SessionId';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { RepositoryError } from '../../../errors/RepositoryError';

export class SupabaseSessionRepository implements ISessionRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(record: any): Session {
        try {
            return new Session(
                new SessionId(record.id),
                new UserId(record.user_id),
                new Date(record.issued_at),
                new Date(record.expires_at),
                record.is_revoked
            );
        } catch (error) {
            throw new RepositoryError(`Failed to map Session from persistence: ${error}`, error);
        }
    }

    private toPersistence(session: Session): any {
        return {
            id: session.id.value,
            user_id: session.userId.value,
            issued_at: session.issuedAt.toISOString(),
            expires_at: session.expiresAt.toISOString(),
            is_revoked: session.isRevoked,
        };
    }

    public async save(session: Session): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('sessions')
                .upsert(this.toPersistence(session));

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to save Session: ${error}`, error);
        }
    }

    public async findById(id: string): Promise<Session | null> {
        try {
            const { data, error } = await this.supabase
                .from('sessions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data ? this.toDomain(data) : null;
        } catch (error) {
            throw new RepositoryError(`Failed to find Session by id: ${error}`, error);
        }
    }

    public async findByUserId(userId: string): Promise<Session[]> {
        try {
            const { data, error } = await this.supabase
                .from('sessions')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            return data ? data.map(record => this.toDomain(record)) : [];
        } catch (error) {
            throw new RepositoryError(`Failed to find Sessions by user id: ${error}`, error);
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete Session: ${error}`, error);
        }
    }
}
