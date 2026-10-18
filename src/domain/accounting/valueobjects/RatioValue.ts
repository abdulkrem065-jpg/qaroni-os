export class RatioValue {
    constructor(public readonly value: number | null) { // null represents division by zero or missing data
        Object.freeze(this);
    }
}
