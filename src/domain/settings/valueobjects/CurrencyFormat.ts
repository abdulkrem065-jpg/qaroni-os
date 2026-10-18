export class CurrencyFormat {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '1,000.00';
        Object.freeze(this);
    }
}
