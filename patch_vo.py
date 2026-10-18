import os

vos = {
    'WorkflowId.ts': """import { EntityId } from '../../shared/valueobjects/EntityId';
export class WorkflowId extends EntityId {}
""",
    'WorkflowInstanceId.ts': """import { EntityId } from '../../shared/valueobjects/EntityId';
export class WorkflowInstanceId extends EntityId {}
""",
    'TaskId.ts': """import { EntityId } from '../../shared/valueobjects/EntityId';
export class TaskId extends EntityId {}
""",
    'WorkflowState.ts': """export class WorkflowState {
    constructor(public readonly value: string) {}
    public equals(other: WorkflowState): boolean {
        return this.value === other.value;
    }
}
""",
    'ApprovalRule.ts': """export type ApprovalType = 'SINGLE' | 'MULTI_LEVEL' | 'SEQUENTIAL' | 'PARALLEL' | 'AUTOMATIC';

export class ApprovalRule {
    public readonly type: ApprovalType;
    public readonly requiredApprovals: number;
    public readonly roles: string[];
    public readonly escalationTimeoutHours?: number;
    public readonly escalationRoles?: string[];

    constructor(props: { type: ApprovalType; requiredApprovals: number; roles: string[]; escalationTimeoutHours?: number; escalationRoles?: string[] }) {
        this.type = props.type;
        this.requiredApprovals = props.requiredApprovals;
        this.roles = [...props.roles];
        this.escalationTimeoutHours = props.escalationTimeoutHours;
        this.escalationRoles = props.escalationRoles ? [...props.escalationRoles] : undefined;
    }
}
"""
}

for name, content in vos.items():
    with open(f'src/domain/workflow/valueobjects/{name}', 'w') as f:
        f.write(content)
