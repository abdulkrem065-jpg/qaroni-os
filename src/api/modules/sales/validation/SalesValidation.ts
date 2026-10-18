import { Request, Response, NextFunction } from 'express';
import { CreateOrderDto, AddItemDto, UpdateItemDto, RegisterPaymentDto } from '../dtos/SalesDto';
import { PaymentMethod } from '../../../../domain/sales/types/SalesTypes';

export class SalesValidation {
    public static validateCreateOrder(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as CreateOrderDto;
        if (!body.branchId) {
            res.status(400).json({ error: 'Validation Error', details: ['branchId is required'] });
            return;
        }
        next();
    }

    public static validateAddItem(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as AddItemDto;
        if (!body.productId || body.quantity === undefined || body.unitPrice === undefined) {
            res.status(400).json({ error: 'Validation Error', details: ['productId, quantity, unitPrice are required'] });
            return;
        }
        next();
    }

    public static validateUpdateItem(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as UpdateItemDto;
        if (body.quantity === undefined || body.unitPrice === undefined) {
            res.status(400).json({ error: 'Validation Error', details: ['quantity and unitPrice are required'] });
            return;
        }
        next();
    }

    public static validateRegisterPayment(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as RegisterPaymentDto;
        if (body.amount === undefined || !body.method || !Object.values(PaymentMethod).includes(body.method)) {
            res.status(400).json({ error: 'Validation Error', details: ['Valid amount and method are required'] });
            return;
        }
        next();
    }
}
