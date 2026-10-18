import re

with open('src/application/customer/usecases/CustomerUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace("import { DomainError } from '../../../domain/shared/errors/DomainError';", "import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';")
content = content.replace("DomainError", "BusinessRuleError")
content = content.replace("'../../shared/interfaces/IEventBus'", "'../../ports/IEventBus'")
content = content.replace("zipCode: customer.address.postalCode,", "postalCode: customer.address.postalCode,")
content = content.replace("zipCode: customer.address.zipCode,", "postalCode: customer.address.postalCode,")

with open('src/application/customer/usecases/CustomerUseCases.ts', 'w') as f:
    f.write(content)

with open('src/domain/customer/aggregates/Customer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { DomainError } from '../../shared/errors/DomainError';", "import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';")
content = content.replace("DomainError", "BusinessRuleError")

with open('src/domain/customer/aggregates/Customer.ts', 'w') as f:
    f.write(content)

with open('tests/application/customer/CustomerUseCases.test.ts', 'r') as f:
    content = f.read()

content = content.replace("'../../../src/application/shared/interfaces/IEventBus'", "'../../../src/application/ports/IEventBus'")

with open('tests/application/customer/CustomerUseCases.test.ts', 'w') as f:
    f.write(content)
