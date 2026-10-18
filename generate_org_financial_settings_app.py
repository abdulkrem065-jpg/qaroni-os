import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# DTO
create_file('src/application/settings/dtos/OrganizationFinancialSettingsDTOs.ts', """export interface UpdateOrganizationFinancialSettingsDTO {
    organizationId: string;
    country: string;
    timeZone: string;
    defaultLanguage?: string;
    dateFormat: string;
    numberFormat: string;
    currencyFormat?: string;
    decimalPrecision: number;
    financialYearStart: number;
    defaultTaxProfileId?: string;
    defaultNumberingProfileId?: string;
}

export interface OrganizationFinancialSettingsResponseDTO {
    id: string;
    organizationId: string;
    country: string;
    timeZone: string;
    defaultLanguage: string;
    dateFormat: string;
    numberFormat: string;
    currencyFormat: string;
    decimalPrecision: number;
    financialYearStart: number;
    defaultTaxProfileId?: string;
    defaultNumberingProfileId?: string;
}
""")

# Use Cases
create_file('src/application/settings/usecases/OrganizationFinancialSettingsUseCases.ts', """import { IOrganizationFinancialSettingsRepository } from '../../../domain/settings/repositories/IOrganizationFinancialSettingsRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationFinancialSettings } from '../../../domain/settings/aggregates/OrganizationFinancialSettings';
import { FinancialSettingsId } from '../../../domain/settings/valueobjects/FinancialSettingsId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
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
import * as crypto from 'crypto';
import { UpdateOrganizationFinancialSettingsDTO, OrganizationFinancialSettingsResponseDTO } from '../dtos/OrganizationFinancialSettingsDTOs';

export class OrganizationFinancialSettingsUseCases {
    constructor(
        private readonly settingsRepo: IOrganizationFinancialSettingsRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async updateSettings(dto: UpdateOrganizationFinancialSettingsDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        
        let settings = await this.settingsRepo.findByOrganization(orgId);

        const country = new Country(dto.country);
        const timeZone = new TimeZone(dto.timeZone);
        const language = new Language(dto.defaultLanguage);
        const dateFormat = new DateFormat(dto.dateFormat);
        const numberFormat = new NumberFormat(dto.numberFormat);
        const currencyFormat = new CurrencyFormat(dto.currencyFormat);
        const decimalPrecision = new DecimalPrecision(dto.decimalPrecision);
        const financialYearStart = new FinancialYearStart(dto.financialYearStart);
        const taxProfileId = dto.defaultTaxProfileId ? new TaxProfileId(dto.defaultTaxProfileId) : undefined;
        const numberingProfileId = dto.defaultNumberingProfileId ? new NumberSequenceId(dto.defaultNumberingProfileId) : undefined;

        if (settings) {
            settings.update(
                country, timeZone, language, dateFormat, numberFormat, currencyFormat, decimalPrecision, financialYearStart, taxProfileId, numberingProfileId
            );
        } else {
            settings = OrganizationFinancialSettings.create(
                new FinancialSettingsId(crypto.randomUUID()),
                orgId,
                country, timeZone, language, dateFormat, numberFormat, currencyFormat, decimalPrecision, financialYearStart, taxProfileId, numberingProfileId
            );
        }

        await this.settingsRepo.save(settings);
        
        for (const ev of settings.domainEvents) {
            await this.eventBus.publish(ev);
        }
        settings.clearDomainEvents();
    }

    public async getSettings(organizationId: string): Promise<OrganizationFinancialSettingsResponseDTO | null> {
        const orgId = new OrganizationId(organizationId);
        const settings = await this.settingsRepo.findByOrganization(orgId);
        
        if (!settings) return null;

        return {
            id: settings.id.value,
            organizationId: settings.organizationId.value,
            country: settings.country.value,
            timeZone: settings.timeZone.value,
            defaultLanguage: settings.defaultLanguage.value,
            dateFormat: settings.dateFormat.value,
            numberFormat: settings.numberFormat.value,
            currencyFormat: settings.currencyFormat.value,
            decimalPrecision: settings.decimalPrecision.value,
            financialYearStart: settings.financialYearStart.value,
            defaultTaxProfileId: settings.defaultTaxProfileId?.value,
            defaultNumberingProfileId: settings.defaultNumberingProfileId?.value
        };
    }
}
""")

# Infrastructure
create_file('src/infrastructure/settings/repositories/SupabaseOrganizationFinancialSettingsRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

print("App & Infra generated")
