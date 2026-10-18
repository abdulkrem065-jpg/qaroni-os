import { ValidationError } from '../../shared/errors/ValidationError';
export class LiabilityTotal {
    public readonly value: number;
    constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
}
