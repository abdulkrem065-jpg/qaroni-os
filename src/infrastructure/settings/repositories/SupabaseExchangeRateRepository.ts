import { SupabaseClient } from '@supabase/supabase-js';
import { IExchangeRateRepository } from '../../../domain/settings/repositories/IExchangeRateRepository';
import { ExchangeRate } from '../../../domain/settings/aggregates/ExchangeRate';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CurrencyId } from '../../../domain/settings/valueobjects/CurrencyId';
import { ExchangeRateId } from '../../../domain/settings/valueobjects/ExchangeRateId';
import { ExchangeRateValue } from '../../../domain/settings/valueobjects/ExchangeRateValue';

export class SupabaseExchangeRateRepository implements IExchangeRateRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): ExchangeRate {
        return ExchangeRate.load(
            new ExchangeRateId(row.id),
            new OrganizationId(row.organization_id),
            new CurrencyId(row.from_currency_id),
            new CurrencyId(row.to_currency_id),
            new ExchangeRateValue(Number(row.rate)),
            new Date(row.effective_date),
            new Date(row.created_at)
        );
    }

    private toPersistence(rate: ExchangeRate): any {
        return {
            id: rate.id.value,
            organization_id: rate.organizationId.value,
            from_currency_id: rate.fromCurrencyId.value,
            to_currency_id: rate.toCurrencyId.value,
            rate: rate.rate.value,
            effective_date: rate.effectiveDate.toISOString(),
            created_at: rate.createdAt.toISOString()
        };
    }

    public async save(exchangeRate: ExchangeRate): Promise<void> {
        const { error } = await this.supabase
            .from('exchange_rates')
            .upsert(this.toPersistence(exchangeRate))
            .eq('id', exchangeRate.id.value)
            .eq('organization_id', exchangeRate.organizationId.value);
        if (error) throw error;
    }

    public async getLatestRate(organizationId: OrganizationId, fromCurrencyId: CurrencyId, toCurrencyId: CurrencyId): Promise<ExchangeRate | null> {
        const { data, error } = await this.supabase
            .from('exchange_rates')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('from_currency_id', fromCurrencyId.value)
            .eq('to_currency_id', toCurrencyId.value)
            .order('effective_date', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<ExchangeRate[]> {
        const { data, error } = await this.supabase
            .from('exchange_rates')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }
}
