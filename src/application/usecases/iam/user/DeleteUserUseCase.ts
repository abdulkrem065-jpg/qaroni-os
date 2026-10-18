import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { ApplicationError } from '../../../errors/ApplicationError';

export class DeleteUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ApplicationError(`User with id ${id} not found`);
        }

        user.delete();
        await this.userRepository.delete(user.id.value);
        await this.eventBus.publishAll(user.domainEvents);
        user.clearDomainEvents();
    }
}
