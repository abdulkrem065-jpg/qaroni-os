import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { WorkflowId } from '../valueobjects/WorkflowId';
import { WorkflowState } from '../valueobjects/WorkflowState';
import { ApprovalRule } from '../valueobjects/ApprovalRule';

export interface WorkflowTransitionDef {
    fromState: WorkflowState;
    toState: WorkflowState;
    action: string;
    approvalRule?: ApprovalRule;
}

export class WorkflowDefinition extends AggregateRoot<WorkflowId> {
    private constructor(
        id: WorkflowId,
        private _name: string,
        private _description: string,
        private _module: string,
        private _initialState: WorkflowState,
        private _transitions: WorkflowTransitionDef[]
    ) {
        super(id);
    }

    public static create(
        id: WorkflowId,
        name: string,
        description: string,
        module: string,
        initialState: WorkflowState,
        transitions: WorkflowTransitionDef[]
    ): WorkflowDefinition {
        return new WorkflowDefinition(id, name, description, module, initialState, transitions);
    }

    get name(): string { return this._name; }
    get description(): string { return this._description; }
    get module(): string { return this._module; }
    get initialState(): WorkflowState { return this._initialState; }
    get transitions(): ReadonlyArray<WorkflowTransitionDef> { return this._transitions; }

    public getTransitionsFrom(state: WorkflowState): WorkflowTransitionDef[] {
        return this._transitions.filter(t => t.fromState.equals(state));
    }

    public getTransition(fromState: WorkflowState, action: string): WorkflowTransitionDef | undefined {
        return this._transitions.find(t => t.fromState.equals(fromState) && t.action === action);
    }
}
