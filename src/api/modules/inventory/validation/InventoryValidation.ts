import { Request, Response, NextFunction } from 'express';
import { ReceiveStockDto, IssueStockDto, TransferStockDto, AdjustStockDto } from '../dtos/InventoryDto';

export class InventoryValidation {
    public static validateReceiveStock(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as ReceiveStockDto;
        if (!body.productId || body.amount === undefined || body.amount <= 0) {
            res.status(400).json({ error: 'Validation Error', details: ['productId is required', 'amount must be greater than 0'] });
            return;
        }
        next();
    }

    public static validateIssueStock(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as IssueStockDto;
        if (!body.productId || body.amount === undefined || body.amount <= 0) {
            res.status(400).json({ error: 'Validation Error', details: ['productId is required', 'amount must be greater than 0'] });
            return;
        }
        next();
    }

    public static validateTransferStock(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as TransferStockDto;
        if (!body.productId || !body.targetBranchId || body.amount === undefined || body.amount <= 0) {
            res.status(400).json({ error: 'Validation Error', details: ['productId and targetBranchId are required', 'amount must be greater than 0'] });
            return;
        }
        next();
    }

    public static validateAdjustStock(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as AdjustStockDto;
        if (!body.productId || body.newAmount === undefined || body.newAmount < 0) {
            res.status(400).json({ error: 'Validation Error', details: ['productId is required', 'newAmount must be greater than or equal to 0'] });
            return;
        }
        next();
    }
}
