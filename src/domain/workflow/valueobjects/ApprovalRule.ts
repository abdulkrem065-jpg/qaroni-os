export type ApprovalType = 'SINGLE' | 'MULTI_LEVEL' | 'SEQUENTIAL' | 'PARALLEL' | 'AUTOMATIC';

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
