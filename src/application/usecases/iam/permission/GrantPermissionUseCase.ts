import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { IPermissionRepository } from '../../../../domain/iam/repositories/IPermissionRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { ApplicationError } from '../../../errors/ApplicationError';

export class GrantPermissionUseCase {
    constructor(
        private roleRepository: IRoleRepository,
        private permissionRepository: IPermissionRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(roleId: string, permissionId: string): Promise<void> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) throw new ApplicationError(`Role with id ${roleId} not found`);

        const permission = await this.permissionRepository.findById(permissionId);
        if (!permission) throw new ApplicationError(`Permission with id ${permissionId} not found`);

        role.grantPermission(permission.id);
        await this.roleRepository.save(role);
        await this.eventBus.publishAll(role.domainEvents);
        role.clearDomainEvents();
    }
}
