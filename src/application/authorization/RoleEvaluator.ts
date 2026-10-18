import { IUserRepository } from '../../domain/iam/repositories/IUserRepository';
import { IRoleRepository } from '../../domain/iam/repositories/IRoleRepository';
import { Role } from '../../domain/iam/aggregates/Role';

export class RoleEvaluator {
    constructor(
        private userRepository: IUserRepository,
        private roleRepository: IRoleRepository
    ) {}

    public async getRolesForUser(userId: string): Promise<Role[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) return [];

        const roles: Role[] = [];
        for (const roleId of user.roleIds) {
            const role = await this.roleRepository.findById(roleId.value);
            if (role) {
                roles.push(role);
            }
        }
        return roles;
    }
}
