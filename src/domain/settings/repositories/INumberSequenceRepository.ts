import { NumberSequence } from '../aggregates/NumberSequence';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface INumberSequenceRepository {
    save(sequence: NumberSequence): Promise<void>;
    findByEntityType(organizationId: OrganizationId, entityType: string): Promise<NumberSequence | null>;
}
