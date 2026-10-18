import fs from 'fs';

// Fix PurchaseOrder.test.ts
let poTest = fs.readFileSync('tests/domain/purchasing/PurchaseOrder.test.ts', 'utf8');
poTest = poTest.replace(/import \{ SupplierReference \} from '..\/..\/..\/src\/domain\/shared\/valueobjects\/SupplierReference';/g, "import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';");
poTest = poTest.replace(/SupplierReference\.create\('sup-1'\)/g, "new SupplierId('sup-1')");
fs.writeFileSync('tests/domain/purchasing/PurchaseOrder.test.ts', poTest);

// Fix PurchasingUseCases.test.ts
let ucTest = fs.readFileSync('tests/application/purchasing/PurchasingUseCases.test.ts', 'utf8');
ucTest = ucTest.replace(/import \{ SupplierReference \} from '..\/..\/..\/src\/domain\/shared\/valueobjects\/SupplierReference';/g, "import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';\nimport { ISupplierRepository } from '../../../src/domain/supplier/repositories/ISupplierRepository';");
// add mockSupplierRepo declaration
ucTest = ucTest.replace(
    "let mockEventBus: IEventBus;",
    "let mockEventBus: IEventBus;\n    let mockSupplierRepo: ISupplierRepository;"
);
ucTest = ucTest.replace(
    "mockEventBus = { publishAll: vi.fn().mockResolvedValue(undefined) } as any;",
    "mockEventBus = { publishAll: vi.fn().mockResolvedValue(undefined) } as any;\n        mockSupplierRepo = { findByIdAndOrganizationId: vi.fn().mockResolvedValue({ status: 'ACTIVE' }) } as any;"
);
ucTest = ucTest.replace(
    "mockOrderRepo, mockInvoiceRepo, mockReceiptRepo, mockInventoryUseCases, mockEventBus",
    "mockOrderRepo, mockInvoiceRepo, mockReceiptRepo, mockInventoryUseCases, mockEventBus, mockSupplierRepo"
);
ucTest = ucTest.replace(/SupplierReference\.create\('sup-1'\)/g, "new SupplierId('sup-1')");
fs.writeFileSync('tests/application/purchasing/PurchasingUseCases.test.ts', ucTest);
