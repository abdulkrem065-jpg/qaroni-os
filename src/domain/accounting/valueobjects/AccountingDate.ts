export class AccountingDate {
    public readonly value: Date;
    constructor(value: Date | string) {
        this.value = new Date(value);
        Object.freeze(this);
    }
}
