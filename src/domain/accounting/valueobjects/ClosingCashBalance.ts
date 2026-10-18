export class ClosingCashBalance {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
