import { Credential } from '../entities/Credential';

export interface ICredentialRepository {
    save(credential: Credential): Promise<void>;
    findByUserId(userId: string): Promise<Credential | null>;
    delete(id: string): Promise<void>;
}
