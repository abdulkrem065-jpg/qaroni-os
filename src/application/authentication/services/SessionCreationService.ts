import * as crypto from 'crypto';
import { ISessionRepository } from '../../../domain/iam/repositories/ISessionRepository';
import { Session } from '../../../domain/iam/entities/Session';
import { SessionId } from '../../../domain/iam/value-objects/SessionId';
import { UserId } from '../../../domain/iam/value-objects/UserId';
import { IEventBus } from '../../ports/IEventBus';
import { SessionCreated } from '../../../domain/iam/events/IamDomainEvents';

export class SessionCreationService {
    constructor(
        private sessionRepository: ISessionRepository,
        private eventBus: IEventBus
    ) {}

    public async createSession(userId: string, ttlSeconds: number): Promise<string> {
        const sessionId = crypto.randomUUID();
        const issuedAt = new Date();
        const expiresAt = new Date(issuedAt.getTime() + ttlSeconds * 1000);

        const session = new Session(
            new SessionId(sessionId),
            new UserId(userId),
            issuedAt,
            expiresAt
        );

        await this.sessionRepository.save(session);
        await this.eventBus.publish(new SessionCreated(sessionId, userId));

        return sessionId;
    }
}
