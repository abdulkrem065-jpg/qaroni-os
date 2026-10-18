import { ISessionRepository } from '../../../domain/security/ports/ISessionRepository';
import { ISession } from '../../../domain/security/models/SecurityModels';

export class SessionEngine {
    constructor(private readonly sessionRepository: ISessionRepository) {}

    public async createSession(session: ISession): Promise<void> {
        await this.sessionRepository.createSession(session);
    }

    public async validateSession(sessionId: string): Promise<boolean> {
        const session = await this.sessionRepository.getSession(sessionId);
        if (!session || !session.isActive || session.expiresAt < new Date()) {
            return false;
        }
        return true;
    }

    public async revokeSession(sessionId: string): Promise<void> {
        await this.sessionRepository.revokeSession(sessionId);
    }

    public async handleConcurrentSessions(userId: string, maxSessions: number): Promise<void> {
        const activeSessions = await this.sessionRepository.getActiveSessionsForUser(userId);
        if (activeSessions.length >= maxSessions) {
            // Revoke the oldest session
            activeSessions.sort((a, b) => a.issuedAt.getTime() - b.issuedAt.getTime());
            await this.sessionRepository.revokeSession(activeSessions[0].id);
        }
    }
}
