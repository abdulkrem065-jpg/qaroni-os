import { IInventoryRepository } from '../../../domain/inventory/repositories/IInventoryRepository';
import { IProductRepository } from '../../../domain/inventory/repositories/IProductRepository';
import { IStockMovementRepository } from '../../../domain/inventory/repositories/IStockMovementRepository';
import { IEventBus } from '../../ports/IEventBus';
import { InventoryItem } from '../../../domain/inventory/aggregates/InventoryItem';
import { StockMovement } from '../../../domain/inventory/aggregates/StockMovement';
import { InventoryItemId } from '../../../domain/shared/valueobjects/InventoryItemId';
import { ProductId } from '../../../domain/shared/valueobjects/ProductId';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { Quantity } from '../../../domain/shared/valueobjects/Quantity';
import { ReorderLevel } from '../../../domain/shared/valueobjects/ReorderLevel';
import { StockMovementId } from '../../../domain/shared/valueobjects/StockMovementId';
import { UserId } from '../../../domain/iam/value-objects/UserId';
import { StockMovementType } from '../../../domain/inventory/types/InventoryTypes';
import { ProductStatus } from '../../../domain/inventory/types/ProductTypes';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export class InventoryUseCases {
    constructor(
        private readonly inventoryRepository: IInventoryRepository,
        private readonly productRepository: IProductRepository,
        private readonly stockMovementRepository: IStockMovementRepository,
        private readonly eventBus: IEventBus
    ) {}

    private async getOrCreateInventoryItem(organizationId: string, branchId: string, productId: string): Promise<InventoryItem> {
        const branch = new BranchId(branchId);
        const product = new ProductId(productId);
        const org = new OrganizationId(organizationId);

        let item = await this.inventoryRepository.findByBranchIdAndProductId(branch, product);
        if (!item) {
            item = InventoryItem.create(
                new InventoryItemId(randomUUID()),
                org,
                branch,
                product,
                ReorderLevel.create(0)
            );
        }
        return item;
    }

    public async receiveStock(organizationId: string, branchId: string, productId: string, amount: number, userId: string, notes: string): Promise<void> {
        const product = await this.productRepository.findByIdAndOrganizationId(new ProductId(productId), new OrganizationId(organizationId));
        if (!product) throw new ValidationError('Product not found');

        const item = await this.getOrCreateInventoryItem(organizationId, branchId, productId);
        
        item.receiveStock(Quantity.create(amount), product.status === ProductStatus.ARCHIVED);
        
        const movement = StockMovement.create(
            new StockMovementId(randomUUID()),
            item.id,
            StockMovementType.RECEIVE,
            Quantity.create(amount),
            notes,
            new UserId(userId)
        );

        await this.inventoryRepository.save(item);
        await this.stockMovementRepository.save(movement);
        await this.eventBus.publishAll(item.domainEvents);
        item.clearDomainEvents();
    }

    public async issueStock(organizationId: string, branchId: string, productId: string, amount: number, userId: string, notes: string): Promise<void> {
        const item = await this.inventoryRepository.findByBranchIdAndProductId(new BranchId(branchId), new ProductId(productId));
        if (!item || item.organizationId.value !== organizationId) {
            throw new ValidationError('Inventory item not found');
        }

        item.issueStock(Quantity.create(amount));

        const movement = StockMovement.create(
            new StockMovementId(randomUUID()),
            item.id,
            StockMovementType.ISSUE,
            Quantity.create(amount),
            notes,
            new UserId(userId)
        );

        await this.inventoryRepository.save(item);
        await this.stockMovementRepository.save(movement);
        await this.eventBus.publishAll(item.domainEvents);
        item.clearDomainEvents();
    }

    public async transferStock(organizationId: string, sourceBranchId: string, targetBranchId: string, productId: string, amount: number, userId: string, notes: string): Promise<void> {
        if (sourceBranchId === targetBranchId) throw new ValidationError('Cannot transfer to the same branch');

        const sourceItem = await this.inventoryRepository.findByBranchIdAndProductId(new BranchId(sourceBranchId), new ProductId(productId));
        if (!sourceItem || sourceItem.organizationId.value !== organizationId) {
            throw new ValidationError('Source inventory item not found');
        }

        const targetItem = await this.getOrCreateInventoryItem(organizationId, targetBranchId, productId);

        sourceItem.transferStock(Quantity.create(amount), new BranchId(targetBranchId));
        targetItem.receiveStock(Quantity.create(amount), false); // Assume product is active if it can be transferred. Or we should check product status.

        const sourceMovement = StockMovement.create(
            new StockMovementId(randomUUID()),
            sourceItem.id,
            StockMovementType.TRANSFER_OUT,
            Quantity.create(amount),
            notes,
            new UserId(userId)
        );

        const targetMovement = StockMovement.create(
            new StockMovementId(randomUUID()),
            targetItem.id,
            StockMovementType.TRANSFER_IN,
            Quantity.create(amount),
            notes,
            new UserId(userId)
        );

        // Should ideally be in a transaction
        await this.inventoryRepository.save(sourceItem);
        await this.stockMovementRepository.save(sourceMovement);
        await this.inventoryRepository.save(targetItem);
        await this.stockMovementRepository.save(targetMovement);

        await this.eventBus.publishAll(sourceItem.domainEvents);
        await this.eventBus.publishAll(targetItem.domainEvents);
        sourceItem.clearDomainEvents();
        targetItem.clearDomainEvents();
    }

    public async adjustStock(organizationId: string, branchId: string, productId: string, newAmount: number, userId: string, notes: string): Promise<void> {
        const item = await this.inventoryRepository.findByBranchIdAndProductId(new BranchId(branchId), new ProductId(productId));
        if (!item || item.organizationId.value !== organizationId) {
            throw new ValidationError('Inventory item not found');
        }

        const oldQuantity = item.quantity.value;
        const newQuantity = Quantity.create(newAmount);
        
        item.adjustStock(newQuantity);

        const movement = StockMovement.create(
            new StockMovementId(randomUUID()),
            item.id,
            StockMovementType.ADJUSTMENT,
            Quantity.create(Math.abs(newAmount - oldQuantity)), // Storing magnitude of change
            notes,
            new UserId(userId)
        );

        await this.inventoryRepository.save(item);
        await this.stockMovementRepository.save(movement);
        await this.eventBus.publishAll(item.domainEvents);
        item.clearDomainEvents();
    }

    public async getInventory(organizationId: string, branchId: string): Promise<InventoryItem[]> {
        const items = await this.inventoryRepository.findAllByBranchId(new BranchId(branchId));
        return items.filter(i => i.organizationId.value === organizationId);
    }

    public async reserveStock(organizationId: string, branchId: string, productId: string, amount: number): Promise<void> {
        const item = await this.inventoryRepository.findByBranchIdAndProductId(new BranchId(branchId), new ProductId(productId));
        if (!item || item.organizationId.value !== organizationId) {
            throw new ValidationError('Inventory item not found');
        }
        item.reserveStock(Quantity.create(amount));
        await this.inventoryRepository.save(item);
    }

    public async releaseReservation(organizationId: string, branchId: string, productId: string, amount: number): Promise<void> {
        const item = await this.inventoryRepository.findByBranchIdAndProductId(new BranchId(branchId), new ProductId(productId));
        if (!item || item.organizationId.value !== organizationId) {
            throw new ValidationError('Inventory item not found');
        }
        item.releaseReservation(Quantity.create(amount));
        await this.inventoryRepository.save(item);
    }
}
