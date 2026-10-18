import re

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

imports = """import { SupabaseCurrencyRepository } from '../../infrastructure/settings/repositories/SupabaseCurrencyRepository';
import { SupabaseExchangeRateRepository } from '../../infrastructure/settings/repositories/SupabaseExchangeRateRepository';
import { SupabaseFiscalRepository } from '../../infrastructure/settings/repositories/SupabaseFiscalRepository';
import { SupabaseTaxRepository } from '../../infrastructure/settings/repositories/SupabaseTaxRepository';
import { SupabaseNumberSequenceRepository } from '../../infrastructure/settings/repositories/SupabaseNumberSequenceRepository';
import { SettingsUseCases } from '../../application/settings/usecases/SettingsUseCases';
import { SettingsModule } from '../../api/modules/settings/SettingsModule';
"""
content = content.replace("export class ApplicationComposer {", imports + "\nexport class ApplicationComposer {")

# Add repositories
repo_injection = """customer: new SupabaseCustomerRepository(db),
            currency: new SupabaseCurrencyRepository(db),
            exchangeRate: new SupabaseExchangeRateRepository(db),
            fiscal: new SupabaseFiscalRepository(db),
            tax: new SupabaseTaxRepository(db),
            sequence: new SupabaseNumberSequenceRepository(db)"""
content = content.replace("customer: new SupabaseCustomerRepository(db)", repo_injection)

# Add use cases
usecase_injection = """customerUseCases: new CustomerUseCases(r.customer, e),
            settingsUseCases: new SettingsUseCases(r.currency, r.exchangeRate, r.fiscal, r.tax, r.sequence, e)"""
content = content.replace("customerUseCases: new CustomerUseCases(r.customer, e),", usecase_injection + ",")

# Add api module
api_injection = """ApiModuleRegistration.register(new CustomerModule(), registry);
        ApiModuleRegistration.register(new SettingsModule(), registry);"""
content = content.replace("ApiModuleRegistration.register(new CustomerModule(), registry);", api_injection)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
