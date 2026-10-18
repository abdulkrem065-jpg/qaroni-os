import { ExchangeRate } from '../aggregates/ExchangeRate';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CurrencyId } from '../valueobjects/CurrencyId';

export interface IExchangeRateRepository {
    save(exchangeRate: ExchangeRate): Promise<void>;
    getLatestRate(organizationId: OrganizationId, fromCurrencyId: CurrencyId, toCurrencyId: CurrencyId): Promise<ExchangeRate | null>;
    findByOrganization(organizationId: OrganizationId): Promise<ExchangeRate[]>;
}
