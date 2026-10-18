const fs = require('fs');

let content = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');

// Add imports
const imports = `
import { SupabaseCustomerRepository } from '../../infrastructure/customer/repositories/SupabaseCustomerRepository';
import { CustomerUseCases } from '../../application/customer/usecases/CustomerUseCases';
import { CustomerModule } from '../../api/modules/customer/CustomerModule';
`;

content = content.replace("export class ApplicationComposer {", imports + "\nexport class ApplicationComposer {");

// Add repository
content = content.replace(
    "supplier: new SupabaseSupplierRepository(db)",
    "supplier: new SupabaseSupplierRepository(db),\n            customer: new SupabaseCustomerRepository(db)"
);

// Add use cases
content = content.replace(
    "supplierUseCases: new SupplierUseCases(r.supplier, e),",
    "supplierUseCases: new SupplierUseCases(r.supplier, e),\n            customerUseCases: new CustomerUseCases(r.customer, e),"
);

// Add api module
content = content.replace(
    "ApiModuleRegistration.register(new SupplierModule(), registry);",
    "ApiModuleRegistration.register(new SupplierModule(), registry);\n        ApiModuleRegistration.register(new CustomerModule(), registry);"
);

fs.writeFileSync('src/application/composition/ApplicationComposer.ts', content);
