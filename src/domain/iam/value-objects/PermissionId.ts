export class PermissionId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('PermissionId cannot be empty');
        }
    }

    public equals(other: PermissionId): boolean {
        return this.value === other.value;
    }
}
