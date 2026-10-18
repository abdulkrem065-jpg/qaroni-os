import { FinancialAuditEvent } from '../../../domain/accounting/aggregates/FinancialAuditEvent';
import { AuditEventId } from '../../../domain/accounting/aggregates/FinancialAuditEvent';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export interface IFinancialAuditEventRepository {
    save(event: FinancialAuditEvent): Promise<void>;
    findById(organizationId: OrganizationId, id: AuditEventId): Promise<FinancialAuditEvent | null>;
    findByEntity(organizationId: OrganizationId, entityType: string, entityId: string): Promise<FinancialAuditEvent[]>;
    findByOrganization(organizationId: OrganizationId): Promise<FinancialAuditEvent[]>;
}
