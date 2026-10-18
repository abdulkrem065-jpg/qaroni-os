import { ICredentialRepository } from '../../../../domain/iam/repositories/ICredentialRepository';
import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { IEventBus } from '../../../ports/IEventBus';
import { PasswordHash } from '../../../../domain/iam/value-objects/PasswordHash';
import { CredentialChanged } from '../../../../domain/iam/events/IamDomainEvents';
import { ApplicationError } from '../../../errors/ApplicationError';

export class ResetPasswordUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private userRepository: IUserRepository,
        private eventBus: IEventBus
    ) {}

    public async execute(userId: string, newPasswordHash: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationError(`User with id ${userId} not found`);

        const credential = await this.credentialRepository.findByUserId(userId);
        if (!credential) {
            throw new ApplicationError(`Credential not found for user ${userId}`);
        }

        // Logic for reset could involve verifying a reset token first, 
        // but since we only deal with UseCases and not auth engine, we just reset it.
        credential.updatePassword(new PasswordHash(newPasswordHash));
        await this.credentialRepository.save(credential);
        
        await this.eventBus.publish(new CredentialChanged(credential.id.value, userId));
    }
}
