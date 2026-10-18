export class OrganizationId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('OrganizationId cannot be empty');
        }
    }
    public equals(other: OrganizationId): boolean {
        return this.value === other.value;
    }
}
