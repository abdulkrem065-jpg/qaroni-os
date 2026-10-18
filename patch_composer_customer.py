import re

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

imports = """import { SupabaseCustomerRepository } from '../../infrastructure/customer/repositories/SupabaseCustomerRepository';
import { CustomerUseCases } from '../customer/usecases/CustomerUseCases';
import { CustomerModule } from '../../api/modules/customer/CustomerModule';
"""
content = content.replace("export class ApplicationComposer {", imports + "\nexport class ApplicationComposer {")

content = content.replace(
    "supplier: new SupabaseSupplierRepository(db)",
    "supplier: new SupabaseSupplierRepository(db),\n            customer: new SupabaseCustomerRepository(db)"
)

content = content.replace(
    "supplierUseCases: new SupplierUseCases(r.supplier, e),",
    "supplierUseCases: new SupplierUseCases(r.supplier, e),\n            customerUseCases: new CustomerUseCases(r.customer, e),"
)

content = content.replace(
    "ApiModuleRegistration.register(new SupplierModule(), registry);",
    "ApiModuleRegistration.register(new SupplierModule(), registry);\n        ApiModuleRegistration.register(new CustomerModule(), registry);"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
