import { ISession } from '../models/SecurityModels';

export interface ISessionRepository {
    createSession(session: ISession): Promise<void>;
    getSession(sessionId: string): Promise<ISession | null>;
    updateSession(session: ISession): Promise<void>;
    revokeSession(sessionId: string): Promise<void>;
    revokeAllUserSessions(userId: string): Promise<void>;
    getActiveSessionsForUser(userId: string): Promise<ISession[]>;
}
