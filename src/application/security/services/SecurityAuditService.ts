import { ISecurityAuditLogger } from '../../../domain/security/ports/ISecurityAudit';

export class SecurityAuditService {
    constructor(private readonly auditLogger: ISecurityAuditLogger) {}

    public async logLoginSuccess(userId: string, ipAddress: string): Promise<void> {
        await this.auditLogger.log({
            eventType: 'LOGIN_SUCCESS',
            userId,
            ipAddress,
            timestamp: new Date(),
            details: {}
        });
    }

    public async logLoginFailure(userId: string, ipAddress: string, reason: string): Promise<void> {
        await this.auditLogger.log({
            eventType: 'LOGIN_FAILURE',
            userId,
            ipAddress,
            timestamp: new Date(),
            details: { reason }
        });
    }

    public async logTokenIssued(userId: string, jti: string): Promise<void> {
        await this.auditLogger.log({
            eventType: 'TOKEN_ISSUED',
            userId,
            timestamp: new Date(),
            details: { jti }
        });
    }

    public async logPermissionDenied(userId: string, resource: string, action: string): Promise<void> {
        await this.auditLogger.log({
            eventType: 'PERMISSION_DENIED',
            userId,
            timestamp: new Date(),
            details: { resource, action }
        });
    }
}
