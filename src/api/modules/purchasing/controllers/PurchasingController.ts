import { Request, Response } from 'express';
import { PurchasingUseCases } from '../../../../application/usecases/purchasing/PurchasingUseCases';
import { CreatePurchaseOrderDto, PurchaseItemDto, ReceiveGoodsDto, RegisterPurchasePaymentDto } from '../dtos/PurchasingDto';

export class PurchasingController {
    constructor(private readonly purchasingUseCases: PurchasingUseCases) {}

    private getUserId(req: Request): string {
        return req.securityContext?.userId || 'system';
    }

    public createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const dto = req.body as CreatePurchaseOrderDto;
            const orderId = await this.purchasingUseCases.createPurchaseOrder(organizationId, dto.branchId, dto.supplierId, this.getUserId(req));
            res.status(201).json({ id: orderId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public listPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const orders = await this.purchasingUseCases.listPurchaseOrders(organizationId);
            res.status(200).json(orders.map(o => ({
                id: o.id.value,
                branchId: o.branchId.value,
                supplierId: o.supplierId.value,
                status: o.status,
                totalAmount: o.totalAmount.value,
                createdAt: o.createdAt
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const order = await this.purchasingUseCases.getPurchaseOrder(organizationId, id);
            res.status(200).json({
                id: order.id.value,
                branchId: order.branchId.value,
                supplierId: order.supplierId.value,
                status: order.status,
                totalAmount: order.totalAmount.value,
                createdAt: order.createdAt,
                items: order.items.map(i => ({
                    id: i.id,
                    productId: i.productId.value,
                    quantity: i.quantity.value,
                    unitPrice: i.unitPrice.value,
                    receivedQuantity: i.receivedQuantity.value,
                    total: i.total.value
                }))
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public addPurchaseItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const dto = req.body as PurchaseItemDto;
            await this.purchasingUseCases.addPurchaseItem(organizationId, id, dto.productId, dto.quantity, dto.unitPrice);
            res.status(200).json({ message: 'Item added successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public updatePurchaseItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id, itemId } = req.params;
            const dto = req.body as PurchaseItemDto;
            await this.purchasingUseCases.updatePurchaseItem(organizationId, id, itemId, dto.quantity, dto.unitPrice);
            res.status(200).json({ message: 'Item updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public removePurchaseItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id, itemId } = req.params;
            await this.purchasingUseCases.removePurchaseItem(organizationId, id, itemId);
            res.status(200).json({ message: 'Item removed successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public approvePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            await this.purchasingUseCases.approvePurchaseOrder(organizationId, id);
            res.status(200).json({ message: 'Order approved successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            await this.purchasingUseCases.cancelPurchaseOrder(organizationId, id);
            res.status(200).json({ message: 'Order cancelled successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public receiveGoods = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const dto = req.body as ReceiveGoodsDto;
            const receiptId = await this.purchasingUseCases.receiveGoods(organizationId, id, this.getUserId(req), dto.items);
            res.status(201).json({ id: receiptId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public generateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const invoiceId = await this.purchasingUseCases.generatePurchaseInvoice(organizationId, id);
            res.status(201).json({ id: invoiceId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public registerPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const dto = req.body as RegisterPurchasePaymentDto;
            await this.purchasingUseCases.registerPurchasePayment(organizationId, id, dto.amount);
            res.status(200).json({ message: 'Payment registered successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
