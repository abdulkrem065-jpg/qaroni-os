import { Request, Response, NextFunction } from 'express';
import { CreateProductDto } from '../dtos/ProductDto';

export class ProductValidation {
    public static validateCreateProduct(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as CreateProductDto;
        const errors: string[] = [];

        if (!body.sku) errors.push('sku is required');
        if (!body.name) errors.push('name is required');
        if (!body.category) errors.push('category is required');
        if (!body.uom) errors.push('uom is required');
        if (body.costPrice === undefined) errors.push('costPrice is required');
        if (body.sellingPrice === undefined) errors.push('sellingPrice is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation Error', details: errors });
            return;
        }
        next();
    }
}
