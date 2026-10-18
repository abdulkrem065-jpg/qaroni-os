import { InventoryItem } from '../aggregates/InventoryItem';
import { InventoryItemId } from '../../shared/valueobjects/InventoryItemId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { ProductId } from '../../shared/valueobjects/ProductId';

export interface IInventoryRepository {
    save(inventoryItem: InventoryItem): Promise<void>;
    findByIdAndOrganizationId(id: InventoryItemId, organizationId: OrganizationId): Promise<InventoryItem | null>;
    findByBranchIdAndProductId(branchId: BranchId, productId: ProductId): Promise<InventoryItem | null>;
    findAllByBranchId(branchId: BranchId): Promise<InventoryItem[]>;
}
