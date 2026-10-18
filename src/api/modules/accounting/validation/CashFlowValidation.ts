import { Request, Response, NextFunction } from 'express';

export class CashFlowValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { startBalanceSheetId, endBalanceSheetId, incomeStatementId } = req.body;
        const errors = [];

        if (!startBalanceSheetId) errors.push('startBalanceSheetId is required');
        if (!endBalanceSheetId) errors.push('endBalanceSheetId is required');
        if (!incomeStatementId) errors.push('incomeStatementId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
