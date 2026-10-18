import { IStockMovementRepository } from '../../../../domain/inventory/repositories/IStockMovementRepository';
import { StockMovement } from '../../../../domain/inventory/aggregates/StockMovement';
import { StockMovementId } from '../../../../domain/shared/valueobjects/StockMovementId';
import { InventoryItemId } from '../../../../domain/shared/valueobjects/InventoryItemId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { Quantity } from '../../../../domain/shared/valueobjects/Quantity';
import { UserId } from '../../../../domain/iam/value-objects/UserId';
import { StockMovementType } from '../../../../domain/inventory/types/InventoryTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStockMovementRepository implements IStockMovementRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): StockMovement {
        return StockMovement.load(
            new StockMovementId(row.id),
            new InventoryItemId(row.inventory_item_id),
            row.type as StockMovementType,
            Quantity.create(row.quantity),
            row.notes,
            new UserId(row.performed_by),
            new Date(row.created_at)
        );
    }

    private mapToRow(movement: StockMovement): any {
        return {
            id: movement.id.value,
            inventory_item_id: movement.inventoryItemId.value,
            type: movement.type,
            quantity: movement.quantity.value,
            notes: movement.notes,
            performed_by: movement.performedBy.value,
            created_at: movement.createdAt.toISOString()
        };
    }

    public async save(movement: StockMovement): Promise<void> {
        const { error } = await this.supabase
            .from('stock_movements')
            .upsert(this.mapToRow(movement));
        if (error) throw new Error(`Failed to save stock movement: ${error.message}`);
    }

    public async findByInventoryItemId(inventoryItemId: InventoryItemId): Promise<StockMovement[]> {
        const { data, error } = await this.supabase
            .from('stock_movements')
            .select('*')
            .eq('inventory_item_id', inventoryItemId.value)
            .order('created_at', { ascending: false });
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }

    public async findByBranchId(branchId: BranchId): Promise<StockMovement[]> {
        // We'd typically do a join here. For simplicity in this simplified repository:
        return [];
    }
}
