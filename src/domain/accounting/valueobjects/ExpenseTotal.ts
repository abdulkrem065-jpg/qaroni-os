export class ExpenseTotal {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
