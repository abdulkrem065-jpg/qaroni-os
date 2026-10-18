import { OrganizationFinancialSettings } from '../aggregates/OrganizationFinancialSettings';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IOrganizationFinancialSettingsRepository {
    save(settings: OrganizationFinancialSettings): Promise<void>;
    findByOrganization(organizationId: OrganizationId): Promise<OrganizationFinancialSettings | null>;
}
