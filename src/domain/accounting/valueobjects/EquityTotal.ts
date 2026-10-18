import { ValidationError } from '../../shared/errors/ValidationError';
export class EquityTotal {
    public readonly value: number;
    constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
}
