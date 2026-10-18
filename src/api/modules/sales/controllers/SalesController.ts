import { Request, Response } from 'express';
import { SalesUseCases } from '../../../../application/usecases/sales/SalesUseCases';
import { CreateOrderDto, AddItemDto, UpdateItemDto, RegisterPaymentDto } from '../dtos/SalesDto';

export class SalesController {
    constructor(private readonly salesUseCases: SalesUseCases) {}

    private getUserId(req: Request): string {
        return req.securityContext?.userId || 'system';
    }

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizationId = req.params.organizationId;
            const dto = req.body as CreateOrderDto;
            
            const orderId = await this.salesUseCases.createSalesOrder(organizationId, dto.branchId, this.getUserId(req));
            res.status(201).json({ id: orderId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public listOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const orders = await this.salesUseCases.listOrders(organizationId);
            res.status(200).json(orders.map(o => ({
                id: o.id.value,
                branchId: o.branchId.value,
                status: o.status,
                totalAmount: o.totalAmount.value,
                createdAt: o.createdAt
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId } = req.params;
            const order = await this.salesUseCases.getOrder(organizationId, orderId);
            res.status(200).json({
                id: order.id.value,
                branchId: order.branchId.value,
                staffId: order.staffId.value,
                status: order.status,
                totalAmount: order.totalAmount.value,
                createdAt: order.createdAt,
                items: order.items.map(i => ({
                    id: i.id,
                    productId: i.productId.value,
                    quantity: i.quantity.value,
                    unitPrice: i.unitPrice.value,
                    discount: i.discount.value,
                    tax: i.tax.value,
                    total: i.total.value
                }))
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public addItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId } = req.params;
            const dto = req.body as AddItemDto;
            await this.salesUseCases.addSalesItem(organizationId, orderId, dto.productId, dto.quantity, dto.unitPrice, dto.discount, dto.tax);
            res.status(200).json({ message: 'Item added successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public removeItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId, itemId } = req.params;
            await this.salesUseCases.removeSalesItem(organizationId, orderId, itemId);
            res.status(200).json({ message: 'Item removed successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public updateItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId, itemId } = req.params;
            const dto = req.body as UpdateItemDto;
            await this.salesUseCases.updateSalesItem(organizationId, orderId, itemId, dto.quantity, dto.unitPrice, dto.discount, dto.tax);
            res.status(200).json({ message: 'Item updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public cancelOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId } = req.params;
            await this.salesUseCases.cancelSalesOrder(organizationId, orderId);
            res.status(200).json({ message: 'Order cancelled successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public completeOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId } = req.params;
            await this.salesUseCases.completeSalesOrder(organizationId, orderId, this.getUserId(req));
            res.status(200).json({ message: 'Order completed successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public generateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, orderId } = req.params;
            const invoiceId = await this.salesUseCases.generateInvoice(organizationId, orderId);
            res.status(201).json({ id: invoiceId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, invoiceId } = req.params;
            const invoice = await this.salesUseCases.getInvoice(organizationId, invoiceId);
            res.status(200).json({
                id: invoice.id.value,
                salesOrderId: invoice.salesOrderId.value,
                invoiceNumber: invoice.invoiceNumber.value,
                totalAmount: invoice.totalAmount.value,
                paidAmount: invoice.paidAmount.value,
                status: invoice.status,
                createdAt: invoice.createdAt
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public registerPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, invoiceId } = req.params;
            const dto = req.body as RegisterPaymentDto;
            const paymentId = await this.salesUseCases.registerPayment(organizationId, invoiceId, dto.amount, dto.method);
            res.status(201).json({ id: paymentId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public refundPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, paymentId } = req.params;
            await this.salesUseCases.refundPayment(organizationId, paymentId);
            res.status(200).json({ message: 'Payment refunded successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
