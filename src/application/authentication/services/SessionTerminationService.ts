import { ISessionRepository } from '../../../domain/iam/repositories/ISessionRepository';
import { IEventBus } from '../../ports/IEventBus';
import { SessionTerminated } from '../../../domain/iam/events/IamDomainEvents';
import { ApplicationError } from '../../errors/ApplicationError';

export class SessionTerminationService {
    constructor(
        private sessionRepository: ISessionRepository,
        private eventBus: IEventBus
    ) {}

    public async terminate(sessionId: string): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new ApplicationError(`Session with id ${sessionId} not found`);
        }

        session.revoke();
        await this.sessionRepository.save(session);
        await this.eventBus.publish(new SessionTerminated(sessionId));
    }
}
