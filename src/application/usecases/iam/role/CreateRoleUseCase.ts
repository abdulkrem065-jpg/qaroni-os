import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { Role } from '../../../../domain/iam/aggregates/Role';
import { RoleId } from '../../../../domain/iam/value-objects/RoleId';
import { OrganizationId } from '../../../../domain/iam/value-objects/OrganizationId';

export class CreateRoleUseCase {
    constructor(
        private roleRepository: IRoleRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(id: string, organizationId: string, name: string, description: string): Promise<void> {
        const role = Role.create(
            new RoleId(id),
            new OrganizationId(organizationId),
            name,
            description
        );
        // Note: No generic role creation event was requested, but we save it.
        await this.roleRepository.save(role);
        await this.eventBus.publishAll(role.domainEvents);
        role.clearDomainEvents();
    }
}
