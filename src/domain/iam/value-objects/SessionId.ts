export class SessionId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('SessionId cannot be empty');
        }
    }

    public equals(other: SessionId): boolean {
        return this.value === other.value;
    }
}
