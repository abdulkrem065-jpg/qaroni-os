import fs from 'fs';
let code = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');

code = code.replace(
    "import { StaffModule } from '../../api/modules/staff/routes/StaffModule';",
    "import { StaffModule } from '../../api/modules/staff/routes/StaffModule';\nimport { ProductModule } from '../../api/modules/product/routes/ProductModule';\nimport { InventoryModule } from '../../api/modules/inventory/routes/InventoryModule';\nimport { SupabaseProductRepository } from '../../infrastructure/persistence/supabase/product/SupabaseProductRepository';\nimport { SupabaseInventoryRepository } from '../../infrastructure/persistence/supabase/inventory/SupabaseInventoryRepository';\nimport { SupabaseStockMovementRepository } from '../../infrastructure/persistence/supabase/inventory/SupabaseStockMovementRepository';\nimport { ProductUseCases } from '../usecases/product/ProductUseCases';\nimport { InventoryUseCases } from '../usecases/inventory/InventoryUseCases';"
);

code = code.replace(
    "staff: new SupabaseStaffRepository(db)",
    "staff: new SupabaseStaffRepository(db),\n            product: new SupabaseProductRepository(db),\n            inventory: new SupabaseInventoryRepository(db),\n            stockMovement: new SupabaseStockMovementRepository(db)"
);

code = code.replace(
    "staffUseCases: new StaffUseCases(r.staff, e),",
    "staffUseCases: new StaffUseCases(r.staff, e),\n            productUseCases: new ProductUseCases(r.product, e),\n            inventoryUseCases: new InventoryUseCases(r.inventory, r.product, r.stockMovement, e),"
);

code = code.replace(
    "ApiModuleRegistration.register(new StaffModule(), registry);",
    "ApiModuleRegistration.register(new StaffModule(), registry);\n        ApiModuleRegistration.register(new ProductModule(), registry);\n        ApiModuleRegistration.register(new InventoryModule(), registry);"
);

fs.writeFileSync('src/application/composition/ApplicationComposer.ts', code);
