export class CredentialId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('CredentialId cannot be empty');
        }
    }

    public equals(other: CredentialId): boolean {
        return this.value === other.value;
    }
}
