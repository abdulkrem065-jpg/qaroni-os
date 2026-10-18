import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { Email } from '../../../../domain/iam/value-objects/Email';
import { PersonName } from '../../../../domain/shared/valueobjects/PersonName';
import { Username } from '../../../../domain/iam/value-objects/Username';
import { ApplicationError } from '../../../errors/ApplicationError';

export class UpdateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(id: string, email?: string, username?: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ApplicationError(`User with id ${id} not found`);
        }

        if (email) {
            const existing = await this.userRepository.findByEmail(email);
            if (existing && existing.id.value !== id) {
                throw new ApplicationError(`Email ${email} is already taken`);
            }
            user.updateEmail(new Email(email));
        }

        if (username) {
            const existing = await this.userRepository.findByUsername(username);
            if (existing && existing.id.value !== id) {
                throw new ApplicationError(`Username ${username} is already taken`);
            }
            user.updateUsername(new PersonName(username, username));
        }

        await this.userRepository.save(user);
        await this.eventBus.publishAll(user.domainEvents);
        user.clearDomainEvents();
    }
}
