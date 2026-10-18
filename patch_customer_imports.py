import os
import re

def replace_in_file(path, old, new):
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)

# CustomerModule.ts
module_path = 'src/api/modules/customer/CustomerModule.ts'
replace_in_file(module_path, "'../../ApiModuleRegistration'", "'../ApiModuleRegistration'")
replace_in_file(module_path, "'../../../routing/RouteRegistry'", "'../../routing/RouteRegistry'")
replace_in_file(module_path, "'../../../../application/customer/usecases/CustomerUseCases'", "'../../../application/customer/usecases/CustomerUseCases'")
replace_in_file(module_path, "'../../../security/SecurityPipeline'", "'../../security/SecurityPipeline'")

# CustomerUseCases.ts
usecases_path = 'src/application/customer/usecases/CustomerUseCases.ts'
replace_in_file(usecases_path, "'../../../application/shared/interfaces/IEventBus'", "'../../shared/interfaces/IEventBus'")
replace_in_file(usecases_path, "'../../../domain/shared/errors/BusinessRuleError'", "'../../../domain/shared/errors/BusinessRuleError'")
replace_in_file(usecases_path, "customer.address.zipCode", "customer.address.postalCode")
replace_in_file(usecases_path, "dto.address.zipCode", "dto.address.postalCode")

# CustomerDTOs.ts
dtos_path = 'src/application/customer/dtos/CustomerDTOs.ts'
replace_in_file(dtos_path, "zipCode: string", "postalCode: string")

# Customer.ts
customer_path = 'src/domain/customer/aggregates/Customer.ts'
replace_in_file(customer_path, "'../../shared/errors/BusinessRuleError'", "'../../shared/errors/BusinessRuleError'")

# SupabaseCustomerRepository.ts
repo_path = 'src/infrastructure/customer/repositories/SupabaseCustomerRepository.ts'
replace_in_file(repo_path, "address_zip_code", "address_postal_code")
replace_in_file(repo_path, "address?.zipCode", "address?.postalCode")

