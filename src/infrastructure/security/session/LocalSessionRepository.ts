import { ISessionRepository } from '../../../domain/security/ports/ISessionRepository';
import { ISession } from '../../../domain/security/models/SecurityModels';

export class LocalSessionRepository implements ISessionRepository {
    private sessions: Map<string, ISession> = new Map();

    public async createSession(session: ISession): Promise<void> {
        this.sessions.set(session.id, session);
    }

    public async getSession(sessionId: string): Promise<ISession | null> {
        return this.sessions.get(sessionId) || null;
    }

    public async updateSession(session: ISession): Promise<void> {
        this.sessions.set(session.id, session);
    }

    public async revokeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.sessions.set(sessionId, session);
        }
    }

    public async revokeAllUserSessions(userId: string): Promise<void> {
        for (const [id, session] of this.sessions.entries()) {
            if (session.userId === userId) {
                session.isActive = false;
                this.sessions.set(id, session);
            }
        }
    }

    public async getActiveSessionsForUser(userId: string): Promise<ISession[]> {
        const active: ISession[] = [];
        for (const session of this.sessions.values()) {
            if (session.userId === userId && session.isActive) {
                active.push(session);
            }
        }
        return active;
    }
}
