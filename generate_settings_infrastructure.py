import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/infrastructure/settings/repositories/SupabaseCurrencyRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ICurrencyRepository } from '../../../domain/settings/repositories/ICurrencyRepository';
import { Currency } from '../../../domain/settings/aggregates/Currency';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CurrencyId } from '../../../domain/settings/valueobjects/CurrencyId';
import { CurrencyCode } from '../../../domain/settings/valueobjects/CurrencyCode';
import { CurrencySymbol } from '../../../domain/settings/valueobjects/CurrencySymbol';

export class SupabaseCurrencyRepository implements ICurrencyRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): Currency {
        return Currency.load(
            new CurrencyId(row.id),
            new OrganizationId(row.organization_id),
            new CurrencyCode(row.code),
            new CurrencySymbol(row.symbol),
            row.is_base,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    private toPersistence(currency: Currency): any {
        return {
            id: currency.id.value,
            organization_id: currency.organizationId.value,
            code: currency.code.value,
            symbol: currency.symbol.value,
            is_base: currency.isBase,
            created_at: currency.createdAt.toISOString(),
            updated_at: currency.updatedAt.toISOString()
        };
    }

    public async save(currency: Currency): Promise<void> {
        const { error } = await this.supabase
            .from('currencies')
            .upsert(this.toPersistence(currency))
            .eq('id', currency.id.value)
            .eq('organization_id', currency.organizationId.value);
        if (error) throw error;
    }

    public async findById(id: CurrencyId, organizationId: OrganizationId): Promise<Currency | null> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<Currency[]> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }

    public async getBaseCurrency(organizationId: OrganizationId): Promise<Currency | null> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('is_base', true)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }
}
""")

create_file('src/infrastructure/settings/repositories/SupabaseExchangeRateRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

create_file('src/infrastructure/settings/repositories/SupabaseFiscalRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { IFiscalRepository } from '../../../domain/settings/repositories/IFiscalRepository';
import { FiscalCalendar, FiscalPeriod } from '../../../domain/settings/aggregates/FiscalCalendar';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { FiscalYear } from '../../../domain/settings/valueobjects/FiscalYear';
import { FiscalCalendarId } from '../../../domain/settings/valueobjects/FiscalCalendarId';

export class SupabaseFiscalRepository implements IFiscalRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): FiscalCalendar {
        const periods = (row.periods || []).map((p: any) => new FiscalPeriod(
            p.id,
            p.name,
            new Date(p.start_date),
            new Date(p.end_date),
            p.status
        ));

        return FiscalCalendar.load(
            new FiscalCalendarId(row.id),
            new OrganizationId(row.organization_id),
            new FiscalYear(row.year),
            periods,
            new Date(row.created_at)
        );
    }

    private toPersistence(calendar: FiscalCalendar): any {
        return {
            id: calendar.id.value,
            organization_id: calendar.organizationId.value,
            year: calendar.year.value,
            periods: calendar.periods.map(p => ({
                id: p.id,
                name: p.name,
                start_date: p.startDate.toISOString(),
                end_date: p.endDate.toISOString(),
                status: p.status
            })),
            created_at: calendar.createdAt.toISOString()
        };
    }

    public async save(calendar: FiscalCalendar): Promise<void> {
        const { error } = await this.supabase
            .from('fiscal_calendars')
            .upsert(this.toPersistence(calendar))
            .eq('id', calendar.id.value)
            .eq('organization_id', calendar.organizationId.value);
        if (error) throw error;
    }

    public async findByYear(organizationId: OrganizationId, year: FiscalYear): Promise<FiscalCalendar | null> {
        const { data, error } = await this.supabase
            .from('fiscal_calendars')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('year', year.value)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<FiscalCalendar[]> {
        const { data, error } = await this.supabase
            .from('fiscal_calendars')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }
}
""")

create_file('src/infrastructure/settings/repositories/SupabaseTaxRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ITaxRepository } from '../../../domain/settings/repositories/ITaxRepository';
import { TaxProfile } from '../../../domain/settings/aggregates/TaxProfile';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TaxProfileId } from '../../../domain/settings/valueobjects/TaxProfileId';
import { TaxRate } from '../../../domain/settings/valueobjects/TaxRate';

export class SupabaseTaxRepository implements ITaxRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): TaxProfile {
        return TaxProfile.load(
            new TaxProfileId(row.id),
            new OrganizationId(row.organization_id),
            row.name,
            new TaxRate(Number(row.rate)),
            row.is_active,
            new Date(row.created_at)
        );
    }

    private toPersistence(tax: TaxProfile): any {
        return {
            id: tax.id.value,
            organization_id: tax.organizationId.value,
            name: tax.name,
            rate: tax.rate.value,
            is_active: tax.isActive,
            created_at: tax.createdAt.toISOString()
        };
    }

    public async save(tax: TaxProfile): Promise<void> {
        const { error } = await this.supabase
            .from('tax_profiles')
            .upsert(this.toPersistence(tax))
            .eq('id', tax.id.value)
            .eq('organization_id', tax.organizationId.value);
        if (error) throw error;
    }

    public async findById(id: TaxProfileId, organizationId: OrganizationId): Promise<TaxProfile | null> {
        const { data, error } = await this.supabase
            .from('tax_profiles')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<TaxProfile[]> {
        const { data, error } = await this.supabase
            .from('tax_profiles')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }
}
""")

create_file('src/infrastructure/settings/repositories/SupabaseNumberSequenceRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { INumberSequenceRepository } from '../../../domain/settings/repositories/INumberSequenceRepository';
import { NumberSequence } from '../../../domain/settings/aggregates/NumberSequence';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { NumberSequenceId } from '../../../domain/settings/valueobjects/NumberSequenceId';
import { SequencePrefix } from '../../../domain/settings/valueobjects/SequencePrefix';
import { SequencePattern } from '../../../domain/settings/valueobjects/SequencePattern';

export class SupabaseNumberSequenceRepository implements INumberSequenceRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): NumberSequence {
        return NumberSequence.load(
            new NumberSequenceId(row.id),
            new OrganizationId(row.organization_id),
            row.entity_type,
            new SequencePrefix(row.prefix),
            new SequencePattern(row.pattern),
            row.current_value,
            new Date(row.created_at)
        );
    }

    private toPersistence(sequence: NumberSequence): any {
        return {
            id: sequence.id.value,
            organization_id: sequence.organizationId.value,
            entity_type: sequence.entityType,
            prefix: sequence.prefix.value,
            pattern: sequence.pattern.value,
            current_value: sequence.currentValue,
            created_at: sequence.createdAt.toISOString()
        };
    }

    public async save(sequence: NumberSequence): Promise<void> {
        const { error } = await this.supabase
            .from('number_sequences')
            .upsert(this.toPersistence(sequence))
            .eq('id', sequence.id.value)
            .eq('organization_id', sequence.organizationId.value);
        if (error) throw error;
    }

    public async findByEntityType(organizationId: OrganizationId, entityType: string): Promise<NumberSequence | null> {
        const { data, error } = await this.supabase
            .from('number_sequences')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('entity_type', entityType)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }
}
""")

print("Settings infrastructure generated")
