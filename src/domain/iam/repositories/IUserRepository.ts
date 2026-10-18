import { User } from '../aggregates/User';
import { UserId } from '../valueobjects/UserId';

export interface IUserRepository {
    findById(id: UserId | string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    exists(id: UserId | string): Promise<boolean>;
    save(user: User): Promise<void>;
    delete(id: UserId | string): Promise<void>;
    findAll(organizationId?: string): Promise<User[]>;
}
