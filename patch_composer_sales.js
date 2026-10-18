import fs from 'fs';
let code = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');

code = code.replace(
    "import { InventoryUseCases } from '../usecases/inventory/InventoryUseCases';",
    "import { InventoryUseCases } from '../usecases/inventory/InventoryUseCases';\nimport { SalesModule } from '../../api/modules/sales/routes/SalesModule';\nimport { SupabaseSalesOrderRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseSalesOrderRepository';\nimport { SupabaseSalesInvoiceRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseSalesInvoiceRepository';\nimport { SupabasePaymentRepository } from '../../infrastructure/persistence/supabase/sales/SupabasePaymentRepository';\nimport { SupabaseReceiptRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseReceiptRepository';\nimport { SalesUseCases } from '../usecases/sales/SalesUseCases';"
);

code = code.replace(
    "stockMovement: new SupabaseStockMovementRepository(db)",
    "stockMovement: new SupabaseStockMovementRepository(db),\n            salesOrder: new SupabaseSalesOrderRepository(db),\n            salesInvoice: new SupabaseSalesInvoiceRepository(db),\n            payment: new SupabasePaymentRepository(db),\n            receipt: new SupabaseReceiptRepository(db)"
);

code = code.replace(
    "inventoryUseCases: new InventoryUseCases(r.inventory, r.product, r.stockMovement, e)",
    "inventoryUseCases: new InventoryUseCases(r.inventory, r.product, r.stockMovement, e),\n            salesUseCases: new SalesUseCases(r.salesOrder, r.salesInvoice, r.payment, r.receipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e)"
);

code = code.replace(
    "ApiModuleRegistration.register(new InventoryModule(), registry);",
    "ApiModuleRegistration.register(new InventoryModule(), registry);\n        ApiModuleRegistration.register(new SalesModule(), registry);"
);

fs.writeFileSync('src/application/composition/ApplicationComposer.ts', code);
