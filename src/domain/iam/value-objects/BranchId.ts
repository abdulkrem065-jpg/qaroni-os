export class BranchId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('BranchId cannot be empty');
        }
    }
    public equals(other: BranchId): boolean {
        return this.value === other.value;
    }
}
