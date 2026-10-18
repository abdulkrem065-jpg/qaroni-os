import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { SKU } from '../../shared/valueobjects/SKU';
import { Barcode } from '../../shared/valueobjects/Barcode';
import { ProductDetails, ProductPricing, ProductStatus } from '../types/ProductTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { ProductCreatedEvent, ProductUpdatedEvent, ProductArchivedEvent, ProductRestoredEvent } from '../events/ProductEvents';

export class Product extends AggregateRoot<ProductId> {
    private readonly _organizationId: OrganizationId;
    private readonly _sku: SKU;
    private readonly _barcode: Barcode | null;
    private _details: ProductDetails;
    private _pricing: ProductPricing;
    private _status: ProductStatus;

    private constructor(
        id: ProductId,
        organizationId: OrganizationId,
        sku: SKU,
        barcode: Barcode | null,
        details: ProductDetails,
        pricing: ProductPricing,
        status: ProductStatus
    ) {
        super(id);
        this._organizationId = organizationId;
        this._sku = sku;
        this._barcode = barcode;
        this._details = details;
        this._pricing = pricing;
        this._status = status;
    }

    public static create(
        id: ProductId,
        organizationId: OrganizationId,
        sku: SKU,
        barcode: Barcode | null,
        details: ProductDetails,
        pricing: ProductPricing
    ): Product {
        const product = new Product(id, organizationId, sku, barcode, details, pricing, ProductStatus.ACTIVE);
        product.addDomainEvent(new ProductCreatedEvent(id, organizationId));
        return product;
    }

    public static load(
        id: ProductId,
        organizationId: OrganizationId,
        sku: SKU,
        barcode: Barcode | null,
        details: ProductDetails,
        pricing: ProductPricing,
        status: ProductStatus
    ): Product {
        return new Product(id, organizationId, sku, barcode, details, pricing, status);
    }

    public updateDetails(details: ProductDetails): void {
        this.verifyActive();
        this._details = details;
        this.addDomainEvent(new ProductUpdatedEvent(this.id));
    }

    public updatePricing(pricing: ProductPricing): void {
        this.verifyActive();
        this._pricing = pricing;
        this.addDomainEvent(new ProductUpdatedEvent(this.id));
    }

    public archive(): void {
        if (this._status === ProductStatus.ARCHIVED) {
            throw new ValidationError('Product is already archived');
        }
        this._status = ProductStatus.ARCHIVED;
        this.addDomainEvent(new ProductArchivedEvent(this.id));
    }

    public restore(): void {
        if (this._status === ProductStatus.ACTIVE) {
            throw new ValidationError('Product is already active');
        }
        this._status = ProductStatus.ACTIVE;
        this.addDomainEvent(new ProductRestoredEvent(this.id));
    }

    private verifyActive(): void {
        if (this._status === ProductStatus.ARCHIVED) {
            throw new ValidationError('Operation not allowed on archived product');
        }
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get sku(): SKU { return this._sku; }
    public get barcode(): Barcode | null { return this._barcode; }
    public get details(): ProductDetails { return this._details; }
    public get pricing(): ProductPricing { return this._pricing; }
    public get status(): ProductStatus { return this._status; }
}
