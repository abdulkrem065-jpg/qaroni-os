import { ValidationError } from '../errors/ValidationError';
export class ProductCategory {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(category: string): ProductCategory {
        if (!category || category.trim().length === 0) {
            throw new ValidationError('Product category cannot be empty');
        }
        return new ProductCategory(category.trim());
    }
}
