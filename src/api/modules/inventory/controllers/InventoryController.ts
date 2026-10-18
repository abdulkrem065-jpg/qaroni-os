import { Request, Response } from 'express';
import { InventoryUseCases } from '../../../../application/usecases/inventory/InventoryUseCases';
import { ReceiveStockDto, IssueStockDto, TransferStockDto, AdjustStockDto } from '../dtos/InventoryDto';

export class InventoryController {
    constructor(private readonly inventoryUseCases: InventoryUseCases) {}

    private getUserId(req: Request): string {
        return req.securityContext?.userId || 'system';
    }

    public receiveStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, branchId } = req.params;
            const dto = req.body as ReceiveStockDto;
            await this.inventoryUseCases.receiveStock(organizationId, branchId, dto.productId, dto.amount, this.getUserId(req), dto.notes || '');
            res.status(200).json({ message: 'Stock received successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public issueStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, branchId } = req.params;
            const dto = req.body as IssueStockDto;
            await this.inventoryUseCases.issueStock(organizationId, branchId, dto.productId, dto.amount, this.getUserId(req), dto.notes || '');
            res.status(200).json({ message: 'Stock issued successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public transferStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, branchId } = req.params;
            const dto = req.body as TransferStockDto;
            await this.inventoryUseCases.transferStock(organizationId, branchId, dto.targetBranchId, dto.productId, dto.amount, this.getUserId(req), dto.notes || '');
            res.status(200).json({ message: 'Stock transferred successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public adjustStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, branchId } = req.params;
            const dto = req.body as AdjustStockDto;
            await this.inventoryUseCases.adjustStock(organizationId, branchId, dto.productId, dto.newAmount, this.getUserId(req), dto.notes || '');
            res.status(200).json({ message: 'Stock adjusted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getInventory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, branchId } = req.params;
            const inventory = await this.inventoryUseCases.getInventory(organizationId, branchId);
            res.status(200).json(inventory.map(item => ({
                id: item.id.value,
                productId: item.productId.value,
                quantity: item.quantity.value,
                reservedQuantity: item.reservedQuantity.value,
                availableQuantity: item.getAvailableQuantity().value,
                reorderLevel: item.reorderLevel.value
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
