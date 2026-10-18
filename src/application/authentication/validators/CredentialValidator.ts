import { ICredentialRepository } from '../../../domain/iam/repositories/ICredentialRepository';
import { PasswordVerificationService } from '../interfaces/PasswordVerificationService';

export class CredentialValidator {
    constructor(
        private credentialRepository: ICredentialRepository,
        private passwordVerification: PasswordVerificationService
    ) {}

    public async validate(userId: string, passwordPlain: string): Promise<boolean> {
        const credential = await this.credentialRepository.findByUserId(userId);
        if (!credential) return false;
        if (!credential.isActive) return false;

        return this.passwordVerification.verify(passwordPlain, credential.passwordHash.value);
    }
}
