export class PostingTimestamp {
    public readonly value: Date;
    constructor(value?: Date | string) {
        this.value = value ? new Date(value) : new Date();
        Object.freeze(this);
    }
}
