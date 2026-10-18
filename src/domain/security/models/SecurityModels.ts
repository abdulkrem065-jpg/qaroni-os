import { EntityId } from '../../shared/valueobjects/EntityId';

export class UserId extends EntityId {}
export class SessionId extends EntityId {}

export interface ITokenPayload {
    sub: string;
    exp: number;
    iat: number;
    jti: string;
    iss: string;
    aud: string;
    claims: Record<string, any>;
}

export interface ISession {
    id: string;
    userId: string;
    token: string;
    issuedAt: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}

export interface ISecurityAuditLog {
    eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'TOKEN_ISSUED' | 'TOKEN_REVOKED' | 'SESSION_EXPIRED' | 'PERMISSION_DENIED';
    userId?: string;
    timestamp: Date;
    details: Record<string, any>;
    ipAddress?: string;
}
