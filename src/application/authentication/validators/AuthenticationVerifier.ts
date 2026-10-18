import { UserId } from '../../../domain/iam/value-objects/UserId';
import { IUserRepository } from '../../../domain/iam/repositories/IUserRepository';
import { IOrganizationVerificationService } from '../interfaces/IOrganizationVerificationService';
import { IBranchVerificationService } from '../interfaces/IBranchVerificationService';
import { User } from '../../../domain/iam/aggregates/User';
import { ApplicationError } from '../../errors/ApplicationError';

export class AuthenticationVerifier {
    constructor(
        private userRepository: IUserRepository,
        private orgVerification: IOrganizationVerificationService,
        private branchVerification: IBranchVerificationService
    ) {}

    public async verifyIdentity(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new ApplicationError('Invalid credentials');
        }

        return this.verifyUserStateAndTenancy(user);
    }

    public async verifyIdentityById(userId: string): Promise<User> {
        const user = await this.userRepository.findById(new UserId(userId));
        if (!user) {
            throw new ApplicationError('Invalid user');
        }

        return this.verifyUserStateAndTenancy(user);
    }

    private async verifyUserStateAndTenancy(user: User): Promise<User> {
        if (!user.isActive) {
            throw new ApplicationError('User account is not active');
        }

        const isOrgActive = await this.orgVerification.isOrganizationActive(user.organizationId.value);
        if (!isOrgActive) {
            throw new ApplicationError('Organization is not active');
        }

        

        return user;
    }
}
