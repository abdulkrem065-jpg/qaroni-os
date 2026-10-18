import os

with open('src/api/modules/settings/routes/SettingsRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace("import { SettingsValidation } from '../validation/SettingsValidation';", "import { SettingsValidation } from '../validation/SettingsValidation';\nimport { OrganizationFinancialSettingsController } from '../controllers/OrganizationFinancialSettingsController';\nimport { OrganizationFinancialSettingsValidation } from '../validation/OrganizationFinancialSettingsValidation';")
content = content.replace("public static register(registry: RouteRegistry, controller: SettingsController, securityPipeline: SecurityPipeline): void {", "public static register(registry: RouteRegistry, controller: SettingsController, orgSettingsController: OrganizationFinancialSettingsController, securityPipeline: SecurityPipeline): void {")

# Add the /settings/general endpoints
general_settings_routes = """
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
"""

content = content.replace("// Currencies", general_settings_routes + "\n        // Currencies")

with open('src/api/modules/settings/routes/SettingsRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/settings/SettingsModule.ts', 'r') as f:
    content = f.read()

content = content.replace("import { SettingsController } from './controllers/SettingsController';", "import { SettingsController } from './controllers/SettingsController';\nimport { OrganizationFinancialSettingsController } from './controllers/OrganizationFinancialSettingsController';\nimport { OrganizationFinancialSettingsUseCases } from '../../../application/settings/usecases/OrganizationFinancialSettingsUseCases';")
content = content.replace("const controller = new SettingsController(settingsUseCases);", "const controller = new SettingsController(settingsUseCases);\n        const orgSettingsUseCases = resolver.resolve('orgSettingsUseCases') as OrganizationFinancialSettingsUseCases;\n        const orgSettingsController = new OrganizationFinancialSettingsController(orgSettingsUseCases);")
content = content.replace("SettingsRoutes.register(registry, controller, securityPipeline);", "SettingsRoutes.register(registry, controller, orgSettingsController, securityPipeline);")

with open('src/api/modules/settings/SettingsModule.ts', 'w') as f:
    f.write(content)

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { SupabaseNumberSequenceRepository } from '../../infrastructure/settings/repositories/SupabaseNumberSequenceRepository';", "import { SupabaseNumberSequenceRepository } from '../../infrastructure/settings/repositories/SupabaseNumberSequenceRepository';\nimport { SupabaseOrganizationFinancialSettingsRepository } from '../../infrastructure/settings/repositories/SupabaseOrganizationFinancialSettingsRepository';\nimport { OrganizationFinancialSettingsUseCases } from '../../application/settings/usecases/OrganizationFinancialSettingsUseCases';")

content = content.replace("sequence: new SupabaseNumberSequenceRepository(db)", "sequence: new SupabaseNumberSequenceRepository(db),\n            orgSettings: new SupabaseOrganizationFinancialSettingsRepository(db)")

content = content.replace("settingsUseCases: new SettingsUseCases(r.currency, r.exchangeRate, r.fiscal, r.tax, r.sequence, e)", "settingsUseCases: new SettingsUseCases(r.currency, r.exchangeRate, r.fiscal, r.tax, r.sequence, e),\n            orgSettingsUseCases: new OrganizationFinancialSettingsUseCases(r.orgSettings, e)")

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)

print("Settings patched")
