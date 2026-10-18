import { Currency } from '../aggregates/Currency';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyId } from '../valueobjects/CurrencyId';

export interface ICurrencyRepository {
    save(currency: Currency): Promise<void>;
    findById(id: CurrencyId, organizationId: OrganizationId): Promise<Currency | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Currency[]>;
    getBaseCurrency(organizationId: OrganizationId): Promise<Currency | null>;
}
