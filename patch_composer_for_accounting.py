import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { SettingsModule } from '../../api/modules/settings/SettingsModule';", "import { SettingsModule } from '../../api/modules/settings/SettingsModule';\nimport { SupabaseAccountRepository } from '../../infrastructure/accounting/repositories/SupabaseAccountRepository';\nimport { AccountUseCases } from '../../application/accounting/usecases/AccountUseCases';\nimport { AccountingModule } from '../../api/modules/accounting/AccountingModule';")

content = content.replace("orgSettings: new SupabaseOrganizationFinancialSettingsRepository(db)", "orgSettings: new SupabaseOrganizationFinancialSettingsRepository(db),\n            account: new SupabaseAccountRepository(db)")

content = content.replace("orgSettingsUseCases: new OrganizationFinancialSettingsUseCases(r.orgSettings, e),", "orgSettingsUseCases: new OrganizationFinancialSettingsUseCases(r.orgSettings, e),\n            accountUseCases: new AccountUseCases(r.account, e),")

content = content.replace("ApiModuleRegistration.register(new SettingsModule(), registry);", "ApiModuleRegistration.register(new SettingsModule(), registry);\n        ApiModuleRegistration.register(new AccountingModule(), registry);")

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)

print("Composer patched")
