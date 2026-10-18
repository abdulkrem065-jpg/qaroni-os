import { EntityId } from './EntityId';
export class StaffId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
