import { ISecurityAuditLog } from '../models/SecurityModels';

export interface ISecurityAuditLogger {
    log(event: ISecurityAuditLog): Promise<void>;
}
