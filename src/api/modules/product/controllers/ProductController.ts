import { Request, Response } from 'express';
import { ProductUseCases } from '../../../../application/usecases/product/ProductUseCases';
import { CreateProductDto, UpdateProductDto } from '../dtos/ProductDto';

export class ProductController {
    constructor(private readonly productUseCases: ProductUseCases) {}

    public createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizationId = req.params.organizationId;
            const dto = req.body as CreateProductDto;
            
            const productId = await this.productUseCases.createProduct(organizationId, dto);
            res.status(201).json({ id: productId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public updateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, productId } = req.params;
            const dto = req.body as UpdateProductDto;
            
            await this.productUseCases.updateProduct(organizationId, productId, dto);
            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, productId } = req.params;
            const product = await this.productUseCases.getProduct(organizationId, productId);
            res.status(200).json({
                id: product.id.value,
                organizationId: product.organizationId.value,
                sku: product.sku.value,
                barcode: product.barcode?.value || null,
                name: product.details.name.value,
                category: product.details.category.value,
                description: product.details.description,
                uom: product.details.uom.value,
                costPrice: product.pricing.costPrice.amount,
                sellingPrice: product.pricing.sellingPrice.amount,
                status: product.status
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public listProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const products = await this.productUseCases.listProducts(organizationId);
            res.status(200).json(products.map(product => ({
                id: product.id.value,
                sku: product.sku.value,
                name: product.details.name.value,
                status: product.status
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public archiveProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, productId } = req.params;
            await this.productUseCases.archiveProduct(organizationId, productId);
            res.status(200).json({ message: 'Product archived successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
    
    // Deleting acts as archiving since we don't want to break FKs in Inventory
    public deleteProduct = async (req: Request, res: Response): Promise<void> => {
        return this.archiveProduct(req, res);
    };
}
