import { TaxProfile } from '../aggregates/TaxProfile';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TaxProfileId } from '../valueobjects/TaxProfileId';

export interface ITaxRepository {
    save(tax: TaxProfile): Promise<void>;
    findById(id: TaxProfileId, organizationId: OrganizationId): Promise<TaxProfile | null>;
    findByOrganization(organizationId: OrganizationId): Promise<TaxProfile[]>;
}
