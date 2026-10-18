import { Journal } from '../aggregates/Journal';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export interface IJournalRepository {
    save(journal: Journal): Promise<void>;
    findById(id: JournalId, organizationId: OrganizationId): Promise<Journal | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Journal[]>;
}
