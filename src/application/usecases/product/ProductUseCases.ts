import { IProductRepository } from '../../../domain/inventory/repositories/IProductRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Product } from '../../../domain/inventory/aggregates/Product';
import { ProductId } from '../../../domain/shared/valueobjects/ProductId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { SKU } from '../../../domain/shared/valueobjects/SKU';
import { Barcode } from '../../../domain/shared/valueobjects/Barcode';
import { ProductName } from '../../../domain/shared/valueobjects/ProductName';
import { ProductCategory } from '../../../domain/shared/valueobjects/ProductCategory';
import { UnitOfMeasure } from '../../../domain/shared/valueobjects/UnitOfMeasure';
import { CostPrice } from '../../../domain/shared/valueobjects/CostPrice';
import { SellingPrice } from '../../../domain/shared/valueobjects/SellingPrice';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export interface CreateProductRequest {
    sku: string;
    barcode?: string;
    name: string;
    category: string;
    description: string;
    uom: string;
    costPrice: number;
    sellingPrice: number;
}

export class ProductUseCases {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createProduct(organizationId: string, request: CreateProductRequest): Promise<string> {
        const orgId = new OrganizationId(organizationId);
        const sku = SKU.create(request.sku);

        const existingSku = await this.productRepository.findByOrganizationIdAndSKU(orgId, sku);
        if (existingSku) {
            throw new ValidationError('SKU must be unique within the organization');
        }

        let barcode: Barcode | null = null;
        if (request.barcode) {
            barcode = Barcode.create(request.barcode);
            const existingBarcode = await this.productRepository.findByOrganizationIdAndBarcode(orgId, barcode);
            if (existingBarcode) {
                throw new ValidationError('Barcode must be unique within the organization');
            }
        }

        const details = {
            name: ProductName.create(request.name),
            category: ProductCategory.create(request.category),
            description: request.description,
            uom: UnitOfMeasure.create(request.uom)
        };

        const pricing = {
            costPrice: CostPrice.create(request.costPrice),
            sellingPrice: SellingPrice.create(request.sellingPrice)
        };

        const productId = new ProductId(randomUUID());
        const product = Product.create(productId, orgId, sku, barcode, details, pricing);

        await this.productRepository.save(product);
        await this.eventBus.publishAll(product.domainEvents);
        product.clearDomainEvents();

        return productId.value;
    }

    public async updateProduct(organizationId: string, productId: string, updates: Partial<CreateProductRequest>): Promise<void> {
        const product = await this.getProductOrThrow(organizationId, productId);

        if (updates.name || updates.category || updates.description !== undefined || updates.uom) {
            const details = {
                name: updates.name ? ProductName.create(updates.name) : product.details.name,
                category: updates.category ? ProductCategory.create(updates.category) : product.details.category,
                description: updates.description !== undefined ? updates.description : product.details.description,
                uom: updates.uom ? UnitOfMeasure.create(updates.uom) : product.details.uom
            };
            product.updateDetails(details);
        }

        if (updates.costPrice !== undefined || updates.sellingPrice !== undefined) {
            const pricing = {
                costPrice: updates.costPrice !== undefined ? CostPrice.create(updates.costPrice) : product.pricing.costPrice,
                sellingPrice: updates.sellingPrice !== undefined ? SellingPrice.create(updates.sellingPrice) : product.pricing.sellingPrice
            };
            product.updatePricing(pricing);
        }

        await this.productRepository.save(product);
        await this.eventBus.publishAll(product.domainEvents);
        product.clearDomainEvents();
    }

    public async archiveProduct(organizationId: string, productId: string): Promise<void> {
        const product = await this.getProductOrThrow(organizationId, productId);
        product.archive();
        await this.productRepository.save(product);
        await this.eventBus.publishAll(product.domainEvents);
        product.clearDomainEvents();
    }

    public async restoreProduct(organizationId: string, productId: string): Promise<void> {
        const product = await this.getProductOrThrow(organizationId, productId);
        product.restore();
        await this.productRepository.save(product);
        await this.eventBus.publishAll(product.domainEvents);
        product.clearDomainEvents();
    }

    public async getProduct(organizationId: string, productId: string): Promise<Product> {
        return this.getProductOrThrow(organizationId, productId);
    }

    public async listProducts(organizationId: string): Promise<Product[]> {
        return this.productRepository.findAllByOrganizationId(new OrganizationId(organizationId));
    }

    private async getProductOrThrow(organizationId: string, productId: string): Promise<Product> {
        const product = await this.productRepository.findByIdAndOrganizationId(
            new ProductId(productId),
            new OrganizationId(organizationId)
        );
        if (!product) {
            throw new ValidationError('Product not found in this organization');
        }
        return product;
    }
}
