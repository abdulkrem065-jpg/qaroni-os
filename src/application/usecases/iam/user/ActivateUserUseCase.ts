import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { ApplicationError } from '../../../errors/ApplicationError';

export class ActivateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ApplicationError(`User with id ${id} not found`);
        }

        user.activate();
        await this.userRepository.save(user);
        await this.eventBus.publishAll(user.domainEvents);
        user.clearDomainEvents();
    }
}
