import { StockMovement } from '../aggregates/StockMovement';
import { InventoryItemId } from '../../shared/valueobjects/InventoryItemId';
import { BranchId } from '../../shared/valueobjects/BranchId';

export interface IStockMovementRepository {
    save(movement: StockMovement): Promise<void>;
    findByInventoryItemId(inventoryItemId: InventoryItemId): Promise<StockMovement[]>;
    findByBranchId(branchId: BranchId): Promise<StockMovement[]>; // Requires joining or storing branchId on movement if needed
}
