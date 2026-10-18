import { Request, Response, NextFunction } from 'express';
import { CreatePurchaseOrderDto, PurchaseItemDto, ReceiveGoodsDto, RegisterPurchasePaymentDto } from '../dtos/PurchasingDto';

export class PurchasingValidation {
    public static validateCreateOrder(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as CreatePurchaseOrderDto;
        if (!body.branchId || !body.supplierId) {
            res.status(400).json({ error: 'Validation Error', details: ['branchId and supplierId are required'] });
            return;
        }
        next();
    }

    public static validateItem(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as PurchaseItemDto;
        if (!body.productId || body.quantity === undefined || body.unitPrice === undefined) {
            res.status(400).json({ error: 'Validation Error', details: ['productId, quantity, unitPrice are required'] });
            return;
        }
        next();
    }

    public static validateReceiveGoods(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as ReceiveGoodsDto;
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            res.status(400).json({ error: 'Validation Error', details: ['items array is required'] });
            return;
        }
        for (const item of body.items) {
            if (!item.productId || item.quantity === undefined) {
                res.status(400).json({ error: 'Validation Error', details: ['Each item must have productId and quantity'] });
                return;
            }
        }
        next();
    }

    public static validatePayment(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as RegisterPurchasePaymentDto;
        if (body.amount === undefined || body.amount < 0) {
            res.status(400).json({ error: 'Validation Error', details: ['amount must be a positive number'] });
            return;
        }
        next();
    }
}
