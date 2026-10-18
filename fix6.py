content = """import { User } from '../aggregates/User';
import { UserId } from '../valueobjects/UserId';

export interface IUserRepository {
    findById(id: UserId): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    exists(id: UserId): Promise<boolean>;
    save(user: User): Promise<void>;
    delete(id: UserId): Promise<void>;
    findAll(organizationId?: string): Promise<User[]>;
}
"""
with open('src/domain/iam/repositories/IUserRepository.ts', 'w') as f:
    f.write(content)

content2 = """import { Role } from '../aggregates/Role';
import { RoleId } from '../valueobjects/RoleId';

export interface IRoleRepository {
    findById(id: RoleId): Promise<Role | null>;
    exists(id: RoleId): Promise<boolean>;
    save(role: Role): Promise<void>;
    delete(id: RoleId): Promise<void>;
    findAll(organizationId?: string): Promise<Role[]>;
}
"""
with open('src/domain/iam/repositories/IRoleRepository.ts', 'w') as f:
    f.write(content2)

