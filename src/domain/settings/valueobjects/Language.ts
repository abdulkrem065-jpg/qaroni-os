export class Language {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : 'en';
        Object.freeze(this);
    }
}
