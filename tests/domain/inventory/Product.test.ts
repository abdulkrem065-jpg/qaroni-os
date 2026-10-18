import { describe, it, expect } from 'vitest';
import { Product } from '../../../src/domain/inventory/aggregates/Product';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { SKU } from '../../../src/domain/shared/valueobjects/SKU';
import { ProductName } from '../../../src/domain/shared/valueobjects/ProductName';
import { ProductCategory } from '../../../src/domain/shared/valueobjects/ProductCategory';
import { UnitOfMeasure } from '../../../src/domain/shared/valueobjects/UnitOfMeasure';
import { CostPrice } from '../../../src/domain/shared/valueobjects/CostPrice';
import { SellingPrice } from '../../../src/domain/shared/valueobjects/SellingPrice';
import { ProductStatus } from '../../../src/domain/inventory/types/ProductTypes';

describe('Product Aggregate', () => {
    it('should create an active product', () => {
        const product = Product.create(
            new ProductId('prod-1'),
            new OrganizationId('org-1'),
            SKU.create('SKU-001'),
            null,
            { name: ProductName.create('Apple'), category: ProductCategory.create('Fruit'), description: 'Fresh', uom: UnitOfMeasure.create('KG') },
            { costPrice: CostPrice.create(1), sellingPrice: SellingPrice.create(2) }
        );

        expect(product.status).toBe(ProductStatus.ACTIVE);
        expect(product.domainEvents.length).toBe(1);
    });

    it('should prevent operations on archived product', () => {
        const product = Product.create(
            new ProductId('prod-1'),
            new OrganizationId('org-1'),
            SKU.create('SKU-001'),
            null,
            { name: ProductName.create('Apple'), category: ProductCategory.create('Fruit'), description: 'Fresh', uom: UnitOfMeasure.create('KG') },
            { costPrice: CostPrice.create(1), sellingPrice: SellingPrice.create(2) }
        );

        product.archive();
        
        expect(() => product.updateDetails({ name: ProductName.create('Pear'), category: ProductCategory.create('Fruit'), description: 'Fresh', uom: UnitOfMeasure.create('KG') }))
            .toThrow('Operation not allowed on archived product');
    });
});
