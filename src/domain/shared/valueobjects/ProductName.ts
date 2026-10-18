import { ValidationError } from '../errors/ValidationError';
export class ProductName {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(name: string): ProductName {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Product name cannot be empty');
        }
        return new ProductName(name.trim());
    }
}
