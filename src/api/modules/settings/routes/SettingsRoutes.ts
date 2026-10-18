import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { SettingsController } from '../controllers/SettingsController';
import { SettingsValidation } from '../validation/SettingsValidation';
import { OrganizationFinancialSettingsController } from '../controllers/OrganizationFinancialSettingsController';
import { OrganizationFinancialSettingsValidation } from '../validation/OrganizationFinancialSettingsValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SettingsRoutes {
    public static register(registry: RouteRegistry, controller: SettingsController, orgSettingsController: OrganizationFinancialSettingsController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/settings';

        
        // General Financial Settings
        registry.register({
            path: `${basePath}/general`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'organization_financial_settings'),
            handler: orgSettingsController.getSettings
        });

        registry.register({
            path: `${basePath}/general`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'organization_financial_settings'),
                OrganizationFinancialSettingsValidation.validateUpdateSettings
            ],
            handler: orgSettingsController.updateSettings
        });

        // Currencies
        registry.register({
            path: `${basePath}/currencies`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'currency'),
                SettingsValidation.validateCreateCurrency
            ],
            handler: controller.createCurrency
        });

        registry.register({
            path: `${basePath}/currencies/:currencyId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'currency'),
                SettingsValidation.validateUpdateCurrency
            ],
            handler: controller.updateCurrency
        });

        registry.register({
            path: `${basePath}/currencies/:currencyId/base`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'currency'),
            handler: controller.changeBaseCurrency
        });

        // Exchange Rates
        registry.register({
            path: `${basePath}/exchange-rates`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'exchange_rate'),
                SettingsValidation.validateCreateExchangeRate
            ],
            handler: controller.createExchangeRate
        });

        // Fiscal Calendar
        registry.register({
            path: `${basePath}/fiscal`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'fiscal_calendar'),
                SettingsValidation.validateCreateFiscalYear
            ],
            handler: controller.createFiscalYear
        });

        registry.register({
            path: `${basePath}/fiscal/:year/periods/:periodId/open`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'fiscal_calendar'),
            handler: controller.openFiscalPeriod
        });

        registry.register({
            path: `${basePath}/fiscal/:year/periods/:periodId/close`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'fiscal_calendar'),
            handler: controller.closeFiscalPeriod
        });

        // Tax Profiles
        registry.register({
            path: `${basePath}/taxes`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'tax_profile'),
                SettingsValidation.validateCreateTaxProfile
            ],
            handler: controller.createTaxProfile
        });

        registry.register({
            path: `${basePath}/taxes/:taxProfileId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'tax_profile'),
                SettingsValidation.validateUpdateTaxProfile
            ],
            handler: controller.updateTaxProfile
        });

        // Number Sequences
        registry.register({
            path: `${basePath}/numbering`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'number_sequence'),
                SettingsValidation.validateCreateNumberSequence
            ],
            handler: controller.createNumberSequence
        });

        registry.register({
            path: `${basePath}/numbering/:entityType/next`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'number_sequence'), // Or maybe generate?
            handler: controller.generateNextNumber
        });
    }
}
