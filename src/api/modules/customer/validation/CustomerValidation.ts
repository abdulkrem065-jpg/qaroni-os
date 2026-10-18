import { Request, Response, NextFunction } from 'express';

export class CustomerValidation {
    public static validateCreateCustomer(req: Request, res: Response, next: NextFunction): void {
        const { code, name } = req.body;
        const errors = [];

        if (!code || typeof code !== 'string') errors.push('code is required and must be a string');
        if (!name || typeof name !== 'string') errors.push('name is required and must be a string');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }

        next();
    }

    public static validateUpdateCustomer(req: Request, res: Response, next: NextFunction): void {
        const { name } = req.body;
        const errors = [];

        if (!name || typeof name !== 'string') errors.push('name is required and must be a string');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }

        next();
    }

    public static validateChangeCreditLimit(req: Request, res: Response, next: NextFunction): void {
        const { creditLimit } = req.body;
        const errors = [];

        if (typeof creditLimit !== 'number' || creditLimit < 0) {
            errors.push('creditLimit must be a positive number');
        }

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }

        next();
    }
}
