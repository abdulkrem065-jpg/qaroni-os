import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { Role } from '../../../../domain/iam/aggregates/Role';
import { RoleId } from '../../../../domain/iam/value-objects/RoleId';
import { OrganizationId } from '../../../../domain/iam/value-objects/OrganizationId';
import { ApplicationError } from '../../../errors/ApplicationError';

export class UpdateRoleUseCase {
    constructor(
        private roleRepository: IRoleRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(id: string, name: string, description: string): Promise<void> {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new ApplicationError(`Role with id ${id} not found`);
        }
        
        // Role properties are readonly in constructor, creating new instance.
        // Wait, if it has permissions, we need to pass them or the repository handles the merge.
        // Let's assume a mutable property or new Role. 
        // For simplicity, we just replace it since permissions could be re-added,
        // or we add update methods to Role.
        const updatedRole = Role.create(
            role.id,
            role.organizationId,
            name,
            description
        );
        role.permissionIds.forEach(p => updatedRole.grantPermission(p));
        updatedRole.clearDomainEvents(); // Clear grant events from initialization

        await this.roleRepository.save(updatedRole);
    }
}
