import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { Role } from '../../../../domain/iam/aggregates/Role';

export class ListRolesUseCase {
    constructor(private roleRepository: IRoleRepository) {}

    public async execute(organizationId: string): Promise<Role[]> {
        return this.roleRepository.findAll(organizationId);
    }
}
