import { IOrganizationFinancialSettingsRepository } from '../../../domain/settings/repositories/IOrganizationFinancialSettingsRepository';
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
