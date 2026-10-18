export class JournalDescription {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '';
        Object.freeze(this);
    }
}
