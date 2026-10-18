import { EntityId } from './EntityId';
export class SupplierId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
