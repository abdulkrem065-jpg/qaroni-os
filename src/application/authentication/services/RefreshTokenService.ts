import { ISessionRepository } from '../../../domain/iam/repositories/ISessionRepository';
import { SessionCreationService } from './SessionCreationService';
import { SessionTerminationService } from './SessionTerminationService';
import { IEventBus } from '../../ports/IEventBus';
import { RefreshSucceeded } from '../../../domain/iam/events/IamDomainEvents';
import { ApplicationError } from '../../errors/ApplicationError';

export class RefreshTokenService {
    constructor(
        private sessionRepository: ISessionRepository,
        private sessionCreationService: SessionCreationService,
        private sessionTerminationService: SessionTerminationService,
        private eventBus: IEventBus
    ) {}

    public async refresh(sessionId: string, ttlSeconds: number): Promise<{newSessionId: string, userId: string}> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new ApplicationError('Invalid session');
        }

        if (!session.isValid()) {
            throw new ApplicationError('Session expired or revoked');
        }

        await this.sessionTerminationService.terminate(sessionId);
        const newSessionId = await this.sessionCreationService.createSession(session.userId.value, ttlSeconds);
        await this.eventBus.publish(new RefreshSucceeded(sessionId, newSessionId));

        return { newSessionId, userId: session.userId.value };
    }
}
