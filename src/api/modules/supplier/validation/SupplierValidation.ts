import { Request, Response, NextFunction } from 'express';
import { CreateSupplierDto, UpdateSupplierDto } from '../dtos/SupplierDto';

export class SupplierValidation {
    public static validateCreate(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as CreateSupplierDto;
        if (!body.code || !body.name) {
            res.status(400).json({ error: 'Validation Error', details: ['code and name are required'] });
            return;
        }
        next();
    }

    public static validateUpdate(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as UpdateSupplierDto;
        if (!body.name) {
            res.status(400).json({ error: 'Validation Error', details: ['name is required'] });
            return;
        }
        next();
    }
}
