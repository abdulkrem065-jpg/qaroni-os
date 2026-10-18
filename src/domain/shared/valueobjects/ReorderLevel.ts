import { ValidationError } from '../errors/ValidationError';
export class ReorderLevel {
    public readonly value: number;
    private constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(level: number): ReorderLevel {
        if (level < 0) {
            throw new ValidationError('Reorder level cannot be negative');
        }
        return new ReorderLevel(level);
    }
}
