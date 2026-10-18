import fs from 'fs';
let code = fs.readFileSync('src/application/usecases/inventory/InventoryUseCases.ts', 'utf8');

const newMethods = `
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
`;

code = code.replace(/}\s*$/, newMethods);
fs.writeFileSync('src/application/usecases/inventory/InventoryUseCases.ts', code);
