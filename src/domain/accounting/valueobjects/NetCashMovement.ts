export class NetCashMovement {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
