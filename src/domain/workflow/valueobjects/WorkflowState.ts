export class WorkflowState {
    constructor(public readonly value: string) {}
    public equals(other: WorkflowState): boolean {
        return this.value === other.value;
    }
}
