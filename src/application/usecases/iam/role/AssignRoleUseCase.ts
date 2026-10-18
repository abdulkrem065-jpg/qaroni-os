import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { ApplicationError } from '../../../errors/ApplicationError';

export class AssignRoleUseCase {
    constructor(
        private userRepository: IUserRepository,
        private roleRepository: IRoleRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(userId: string, roleId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationError(`User with id ${userId} not found`);
        
        const role = await this.roleRepository.findById(roleId);
        if (!role) throw new ApplicationError(`Role with id ${roleId} not found`);

        user.assignRole(role.id);
        await this.userRepository.save(user);
        await this.eventBus.publishAll(user.domainEvents);
        user.clearDomainEvents();
    }
}
