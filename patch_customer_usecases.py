import re

with open('src/application/customer/usecases/CustomerUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace("import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';", "import { DomainError } from '../../../domain/shared/errors/DomainError';")
content = content.replace("BusinessRuleError", "DomainError")
content = content.replace("import { v4 as uuidv4 } from 'uuid';", "import * as crypto from 'crypto';")
content = content.replace("uuidv4()", "crypto.randomUUID()")

with open('src/application/customer/usecases/CustomerUseCases.ts', 'w') as f:
    f.write(content)

with open('src/domain/customer/aggregates/Customer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';", "import { DomainError } from '../../shared/errors/DomainError';")
content = content.replace("BusinessRuleError", "DomainError")

with open('src/domain/customer/aggregates/Customer.ts', 'w') as f:
    f.write(content)
