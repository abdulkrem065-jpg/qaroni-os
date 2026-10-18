import { WorkflowDefinition, WorkflowTransitionDef } from '../aggregates/WorkflowDefinition';
import { WorkflowId } from '../valueobjects/WorkflowId';
import { WorkflowState } from '../valueobjects/WorkflowState';
import { ApprovalRule } from '../valueobjects/ApprovalRule';
import * as crypto from 'crypto';

export class WorkflowBuilder {
    private _name!: string;
    private _description!: string;
    private _module!: string;
    private _initialState!: WorkflowState;
    private _transitions: WorkflowTransitionDef[] = [];

    public static create(name: string): WorkflowBuilder {
        const builder = new WorkflowBuilder();
        builder._name = name;
        return builder;
    }

    public description(desc: string): WorkflowBuilder {
        this._description = desc;
        return this;
    }

    public module(mod: string): WorkflowBuilder {
        this._module = mod;
        return this;
    }

    public initialState(state: string): WorkflowBuilder {
        this._initialState = new WorkflowState(state);
        return this;
    }

    public addTransition(from: string, to: string, action: string, approvalRule?: ApprovalRule): WorkflowBuilder {
        this._transitions.push({
            fromState: new WorkflowState(from),
            toState: new WorkflowState(to),
            action,
            approvalRule
        });
        return this;
    }

    public build(): WorkflowDefinition {
        return WorkflowDefinition.create(
            new WorkflowId(crypto.randomUUID()),
            this._name,
            this._description,
            this._module,
            this._initialState,
            this._transitions
        );
    }
}
