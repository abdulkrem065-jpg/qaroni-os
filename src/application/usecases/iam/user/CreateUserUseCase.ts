import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { User } from '../../../../domain/iam/aggregates/User';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { OrganizationId } from '../../../../domain/iam/value-objects/OrganizationId';
import { EmailAddress } from "../../../../domain/shared/valueobjects/EmailAddress";
import { PersonName } from "../../../../domain/shared/valueobjects/PersonName";
import { BranchId } from '../../../../domain/iam/value-objects/BranchId';
import { ApplicationError } from '../../../errors/ApplicationError';

export class CreateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(
        id: string,
        organizationId: string,
        email: string,
        username: string,
        branchId?: string
    ): Promise<void> {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApplicationError(`User with email ${email} already exists`);
        }

        const existingUsername = await this.userRepository.findByUsername(username);
        if (existingUsername) {
            throw new ApplicationError(`User with username ${username} already exists`);
        }

        const user = User.register(
            new UserId(id),
            new OrganizationId(organizationId),
            new EmailAddress(email),
            new PersonName(username, username)
            
        );

        await this.userRepository.save(user);
        await this.eventBus.publishAll(user.domainEvents);
        user.clearDomainEvents();
    }
}
