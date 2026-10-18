import { ISessionRepository } from '../../../../domain/iam/repositories/ISessionRepository';
import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { Session } from '../../../../domain/iam/entities/Session';
import { SessionId } from '../../../../domain/iam/value-objects/SessionId';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { ApplicationError } from '../../../errors/ApplicationError';

export class CreateSessionUseCase {
    constructor(
        private sessionRepository: ISessionRepository,
        private userRepository: IUserRepository
    ) {}

    public async execute(id: string, userId: string, issuedAt: Date, expiresAt: Date): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApplicationError(`User with id ${userId} not found`);
        }
        if (!user.isActive) {
            throw new ApplicationError(`Cannot create session for inactive user ${userId}`);
        }

        const session = new Session(
            new SessionId(id),
            new UserId(userId),
            issuedAt,
            expiresAt
        );
        await this.sessionRepository.save(session);
    }
}
