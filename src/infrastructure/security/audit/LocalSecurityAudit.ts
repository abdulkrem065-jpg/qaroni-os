import { ISecurityAuditLogger } from '../../../domain/security/ports/ISecurityAudit';
import { ISecurityAuditLog } from '../../../domain/security/models/SecurityModels';

export class LocalSecurityAuditLogger implements ISecurityAuditLogger {
    public async log(event: ISecurityAuditLog): Promise<void> {
        console.log(`[SECURITY AUDIT] ${event.eventType} - User: ${event.userId || 'System'} - Time: ${event.timestamp.toISOString()}`);
    }
}
