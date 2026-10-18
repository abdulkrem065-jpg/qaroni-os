import fs from 'fs';

// 1. Update PurchaseOrder aggregate
let poCode = fs.readFileSync('src/domain/purchasing/aggregates/PurchaseOrder.ts', 'utf8');
poCode = poCode.replace("import { SupplierReference } from '../../shared/valueobjects/SupplierReference';", "import { SupplierId } from '../../shared/valueobjects/SupplierId';");
poCode = poCode.replace(/SupplierReference/g, 'SupplierId');
poCode = poCode.replace(/_supplierReference/g, '_supplierId');
poCode = poCode.replace(/supplierReference/g, 'supplierId');
fs.writeFileSync('src/domain/purchasing/aggregates/PurchaseOrder.ts', poCode);

// 2. Update PurchasingUseCases
let ucCode = fs.readFileSync('src/application/usecases/purchasing/PurchasingUseCases.ts', 'utf8');
ucCode = ucCode.replace("import { SupplierReference } from '../../../domain/shared/valueobjects/SupplierReference';", "import { SupplierId } from '../../../domain/shared/valueobjects/SupplierId';\nimport { ISupplierRepository } from '../../../domain/supplier/repositories/ISupplierRepository';\nimport { SupplierStatus } from '../../../domain/supplier/types/SupplierTypes';");
// Modify constructor to accept supplierRepo
ucCode = ucCode.replace(
    "private readonly eventBus: IEventBus",
    "private readonly eventBus: IEventBus,\n        private readonly supplierRepo: ISupplierRepository"
);
// Modify createPurchaseOrder signature
ucCode = ucCode.replace(
    "public async createPurchaseOrder(organizationId: string, branchId: string, supplierReference: string, userId: string): Promise<string> {",
    "public async createPurchaseOrder(organizationId: string, branchId: string, supplierIdStr: string, userId: string): Promise<string> {\n        const supplierId = new SupplierId(supplierIdStr);\n        const supplier = await this.supplierRepo.findByIdAndOrganizationId(supplierId, new OrganizationId(organizationId));\n        if (!supplier) throw new ValidationError('Supplier not found');\n        if (supplier.status === SupplierStatus.ARCHIVED) throw new ValidationError('Cannot create purchase order for archived supplier');\n        if (supplier.status === SupplierStatus.SUSPENDED) throw new ValidationError('Cannot create purchase order for suspended supplier');"
);
ucCode = ucCode.replace(
    "SupplierReference.create(supplierReference),",
    "supplierId,"
);
fs.writeFileSync('src/application/usecases/purchasing/PurchasingUseCases.ts', ucCode);

// 3. Update SupabasePurchaseOrderRepository
let repoCode = fs.readFileSync('src/infrastructure/persistence/supabase/purchasing/SupabasePurchaseOrderRepository.ts', 'utf8');
repoCode = repoCode.replace("import { SupplierReference } from '../../../../domain/shared/valueobjects/SupplierReference';", "import { SupplierId } from '../../../../domain/shared/valueobjects/SupplierId';");
repoCode = repoCode.replace(/SupplierReference/g, 'SupplierId');
repoCode = repoCode.replace(/supplier_reference/g, 'supplier_id');
repoCode = repoCode.replace(/supplierReference/g, 'supplierId');
repoCode = repoCode.replace(/SupplierId\.create/g, 'new SupplierId'); // because we replace SupplierReference.create with SupplierId.create, but it's new SupplierId
fs.writeFileSync('src/infrastructure/persistence/supabase/purchasing/SupabasePurchaseOrderRepository.ts', repoCode);

// 4. Update PurchasingDto
let dtoCode = fs.readFileSync('src/api/modules/purchasing/dtos/PurchasingDto.ts', 'utf8');
dtoCode = dtoCode.replace("supplierReference: string;", "supplierId: string;");
fs.writeFileSync('src/api/modules/purchasing/dtos/PurchasingDto.ts', dtoCode);

// 5. Update PurchasingValidation
let valCode = fs.readFileSync('src/api/modules/purchasing/validation/PurchasingValidation.ts', 'utf8');
valCode = valCode.replace("!body.supplierReference", "!body.supplierId");
valCode = valCode.replace("branchId and supplierReference are required", "branchId and supplierId are required");
fs.writeFileSync('src/api/modules/purchasing/validation/PurchasingValidation.ts', valCode);

// 6. Update PurchasingController
let ctrlCode = fs.readFileSync('src/api/modules/purchasing/controllers/PurchasingController.ts', 'utf8');
ctrlCode = ctrlCode.replace("dto.supplierReference", "dto.supplierId");
ctrlCode = ctrlCode.replace("supplierReference: o.supplierReference.value", "supplierId: o.supplierId.value");
ctrlCode = ctrlCode.replace("supplierReference: order.supplierReference.value", "supplierId: order.supplierId.value");
fs.writeFileSync('src/api/modules/purchasing/controllers/PurchasingController.ts', ctrlCode);

// 7. Update ApplicationComposer
let compCode = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');
compCode = compCode.replace(
    "import { PurchasingUseCases } from '../usecases/purchasing/PurchasingUseCases';",
    "import { PurchasingUseCases } from '../usecases/purchasing/PurchasingUseCases';\nimport { SupabaseSupplierRepository } from '../../infrastructure/persistence/supabase/supplier/SupabaseSupplierRepository';\nimport { SupplierUseCases } from '../usecases/supplier/SupplierUseCases';\nimport { SupplierModule } from '../../api/modules/supplier/routes/SupplierModule';"
);
compCode = compCode.replace(
    "goodsReceipt: new SupabaseGoodsReceiptRepository(db)",
    "goodsReceipt: new SupabaseGoodsReceiptRepository(db),\n            supplier: new SupabaseSupplierRepository(db)"
);
compCode = compCode.replace(
    "purchasingUseCases: new PurchasingUseCases(r.purchaseOrder, r.purchaseInvoice, r.goodsReceipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e)",
    "purchasingUseCases: new PurchasingUseCases(r.purchaseOrder, r.purchaseInvoice, r.goodsReceipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e, r.supplier),\n            supplierUseCases: new SupplierUseCases(r.supplier, e)"
);
compCode = compCode.replace(
    "ApiModuleRegistration.register(new PurchasingModule(), registry);",
    "ApiModuleRegistration.register(new PurchasingModule(), registry);\n        ApiModuleRegistration.register(new SupplierModule(), registry);"
);
fs.writeFileSync('src/application/composition/ApplicationComposer.ts', compCode);
