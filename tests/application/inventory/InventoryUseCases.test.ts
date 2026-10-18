import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryUseCases } from '../../../src/application/usecases/inventory/InventoryUseCases';
import { IInventoryRepository } from '../../../src/domain/inventory/repositories/IInventoryRepository';
import { IProductRepository } from '../../../src/domain/inventory/repositories/IProductRepository';
import { IStockMovementRepository } from '../../../src/domain/inventory/repositories/IStockMovementRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { Product } from '../../../src/domain/inventory/aggregates/Product';
import { InventoryItem } from '../../../src/domain/inventory/aggregates/InventoryItem';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { InventoryItemId } from '../../../src/domain/shared/valueobjects/InventoryItemId';
import { Quantity } from '../../../src/domain/shared/valueobjects/Quantity';
import { ReorderLevel } from '../../../src/domain/shared/valueobjects/ReorderLevel';
import { SKU } from '../../../src/domain/shared/valueobjects/SKU';
import { ProductName } from '../../../src/domain/shared/valueobjects/ProductName';
import { ProductCategory } from '../../../src/domain/shared/valueobjects/ProductCategory';
import { UnitOfMeasure } from '../../../src/domain/shared/valueobjects/UnitOfMeasure';
import { CostPrice } from '../../../src/domain/shared/valueobjects/CostPrice';
import { SellingPrice } from '../../../src/domain/shared/valueobjects/SellingPrice';

describe('InventoryUseCases', () => {
    let mockInventoryRepo: IInventoryRepository;
    let mockProductRepo: IProductRepository;
    let mockStockMovementRepo: IStockMovementRepository;
    let mockEventBus: IEventBus;
    let inventoryUseCases: InventoryUseCases;

    const orgId = 'org-1';
    const branchId = 'branch-1';
    const productId = 'prod-1';
    const userId = 'user-1';

    beforeEach(() => {
        mockInventoryRepo = {
            save: vi.fn().mockResolvedValue(undefined),
            findByIdAndOrganizationId: vi.fn(),
            findByBranchIdAndProductId: vi.fn(),
            findAllByBranchId: vi.fn(),
        } as any;

        mockProductRepo = {
            save: vi.fn(),
            findByIdAndOrganizationId: vi.fn(),
            findByOrganizationIdAndSKU: vi.fn(),
            findByOrganizationIdAndBarcode: vi.fn(),
            findAllByOrganizationId: vi.fn()
        } as any;

        mockStockMovementRepo = {
            save: vi.fn().mockResolvedValue(undefined),
            findByInventoryItemId: vi.fn(),
            findByBranchId: vi.fn()
        } as any;

        mockEventBus = {
            publishAll: vi.fn().mockResolvedValue(undefined)
        } as any;

        inventoryUseCases = new InventoryUseCases(mockInventoryRepo, mockProductRepo, mockStockMovementRepo, mockEventBus);
    });

    it('should receive stock successfully', async () => {
        const product = Product.create(
            new ProductId(productId),
            new OrganizationId(orgId),
            SKU.create('SKU1'),
            null,
            { name: ProductName.create('Apple'), category: ProductCategory.create('F'), description: 'd', uom: UnitOfMeasure.create('KG') },
            { costPrice: CostPrice.create(1), sellingPrice: SellingPrice.create(2) }
        );
        vi.spyOn(mockProductRepo, 'findByIdAndOrganizationId').mockResolvedValue(product);
        vi.spyOn(mockInventoryRepo, 'findByBranchIdAndProductId').mockResolvedValue(null);

        await inventoryUseCases.receiveStock(orgId, branchId, productId, 50, userId, 'Initial stock');

        expect(mockInventoryRepo.save).toHaveBeenCalled();
        expect(mockStockMovementRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publishAll).toHaveBeenCalled();
    });

    it('should issue stock successfully', async () => {
        const item = InventoryItem.create(
            new InventoryItemId('inv-1'),
            new OrganizationId(orgId),
            new BranchId(branchId),
            new ProductId(productId),
            ReorderLevel.create(10)
        );
        item.receiveStock(Quantity.create(50), false);
        item.clearDomainEvents();

        vi.spyOn(mockInventoryRepo, 'findByBranchIdAndProductId').mockResolvedValue(item);

        await inventoryUseCases.issueStock(orgId, branchId, productId, 20, userId, 'Sale');

        expect(item.quantity.value).toBe(30);
        expect(mockInventoryRepo.save).toHaveBeenCalledWith(item);
        expect(mockStockMovementRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publishAll).toHaveBeenCalled();
    });
});
