import { Request, Response, NextFunction } from 'express';

export class FinancialRatiosValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { balanceSheetId, incomeStatementId } = req.body;
        const errors = [];

        if (!balanceSheetId) errors.push('balanceSheetId is required');
        if (!incomeStatementId) errors.push('incomeStatementId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
