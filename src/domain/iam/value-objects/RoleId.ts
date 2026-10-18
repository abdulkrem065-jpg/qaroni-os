export class RoleId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('RoleId cannot be empty');
        }
    }

    public equals(other: RoleId): boolean {
        return this.value === other.value;
    }
}
