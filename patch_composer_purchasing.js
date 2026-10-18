import fs from 'fs';
let code = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');

code = code.replace(
    "import { SalesModule } from '../../api/modules/sales/routes/SalesModule';",
    "import { SalesModule } from '../../api/modules/sales/routes/SalesModule';\nimport { PurchasingModule } from '../../api/modules/purchasing/routes/PurchasingModule';\nimport { SupabasePurchaseOrderRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabasePurchaseOrderRepository';\nimport { SupabasePurchaseInvoiceRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabasePurchaseInvoiceRepository';\nimport { SupabaseGoodsReceiptRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabaseGoodsReceiptRepository';\nimport { PurchasingUseCases } from '../usecases/purchasing/PurchasingUseCases';"
);

code = code.replace(
    "receipt: new SupabaseReceiptRepository(db)",
    "receipt: new SupabaseReceiptRepository(db),\n            purchaseOrder: new SupabasePurchaseOrderRepository(db),\n            purchaseInvoice: new SupabasePurchaseInvoiceRepository(db),\n            goodsReceipt: new SupabaseGoodsReceiptRepository(db)"
);

code = code.replace(
    "salesUseCases: new SalesUseCases(r.salesOrder, r.salesInvoice, r.payment, r.receipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e)",
    "salesUseCases: new SalesUseCases(r.salesOrder, r.salesInvoice, r.payment, r.receipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e),\n            purchasingUseCases: new PurchasingUseCases(r.purchaseOrder, r.purchaseInvoice, r.goodsReceipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e)"
);

code = code.replace(
    "ApiModuleRegistration.register(new SalesModule(), registry);",
    "ApiModuleRegistration.register(new SalesModule(), registry);\n        ApiModuleRegistration.register(new PurchasingModule(), registry);"
);

fs.writeFileSync('src/application/composition/ApplicationComposer.ts', code);
