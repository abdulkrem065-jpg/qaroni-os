import { SupabaseClient } from '@supabase/supabase-js';
import { IOrganizationFinancialSettingsRepository } from '../../../domain/settings/repositories/IOrganizationFinancialSettingsRepository';
import { OrganizationFinancialSettings } from '../../../domain/settings/aggregates/OrganizationFinancialSettings';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { FinancialSettingsId } from '../../../domain/settings/valueobjects/FinancialSettingsId';
import { Country } from '../../../domain/settings/valueobjects/Country';
import { TimeZone } from '../../../domain/settings/valueobjects/TimeZone';
import { Language } from '../../../domain/settings/valueobjects/Language';
import { DateFormat } from '../../../domain/settings/valueobjects/DateFormat';
import { NumberFormat } from '../../../domain/settings/valueobjects/NumberFormat';
import { CurrencyFormat } from '../../../domain/settings/valueobjects/CurrencyFormat';
import { DecimalPrecision } from '../../../domain/settings/valueobjects/DecimalPrecision';
import { FinancialYearStart } from '../../../domain/settings/valueobjects/FinancialYearStart';
import { TaxProfileId } from '../../../domain/settings/valueobjects/TaxProfileId';
import { NumberSequenceId } from '../../../domain/settings/valueobjects/NumberSequenceId';

export class SupabaseOrganizationFinancialSettingsRepository implements IOrganizationFinancialSettingsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): OrganizationFinancialSettings {
        return OrganizationFinancialSettings.load(
            new FinancialSettingsId(row.id),
            new OrganizationId(row.organization_id),
            new Country(row.country),
            new TimeZone(row.time_zone),
            new Language(row.default_language),
            new DateFormat(row.date_format),
            new NumberFormat(row.number_format),
            new CurrencyFormat(row.currency_format),
            new DecimalPrecision(Number(row.decimal_precision)),
            new FinancialYearStart(Number(row.financial_year_start)),
            row.default_tax_profile_id ? new TaxProfileId(row.default_tax_profile_id) : undefined,
            row.default_numbering_profile_id ? new NumberSequenceId(row.default_numbering_profile_id) : undefined
        );
    }

    private toPersistence(settings: OrganizationFinancialSettings): any {
        return {
            id: settings.id.value,
            organization_id: settings.organizationId.value,
            country: settings.country.value,
            time_zone: settings.timeZone.value,
            default_language: settings.defaultLanguage.value,
            date_format: settings.dateFormat.value,
            number_format: settings.numberFormat.value,
            currency_format: settings.currencyFormat.value,
            decimal_precision: settings.decimalPrecision.value,
            financial_year_start: settings.financialYearStart.value,
            default_tax_profile_id: settings.defaultTaxProfileId?.value || null,
            default_numbering_profile_id: settings.defaultNumberingProfileId?.value || null,
            updated_at: new Date().toISOString()
        };
    }

    public async save(settings: OrganizationFinancialSettings): Promise<void> {
        const { error } = await this.supabase
            .from('organization_financial_settings')
            .upsert(this.toPersistence(settings))
            .eq('organization_id', settings.organizationId.value);
            
        if (error) throw error;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<OrganizationFinancialSettings | null> {
        const { data, error } = await this.supabase
            .from('organization_financial_settings')
            .select('*')
            .eq('organization_id', organizationId.value)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        
        return data ? this.toDomain(data) : null;
    }
}
