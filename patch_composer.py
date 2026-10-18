import re

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

# Add imports
imports = """
import { WorkflowOrchestrator } from '../workflow/usecases/WorkflowOrchestrator';
import { TaskUseCases } from '../workflow/usecases/TaskUseCases';
import { ApprovalUseCases } from '../workflow/usecases/ApprovalUseCases';
import { WorkflowEventDispatcher } from '../workflow/services/WorkflowEventDispatcher';
"""
content = content.replace("import { ApplicationUseCases } from './ApplicationUseCases';", imports + "import { ApplicationUseCases } from './ApplicationUseCases';")

# Add to ApplicationUseCases interface
use_cases_def = """
    workflowOrchestrator: WorkflowOrchestrator;
    taskUseCases: TaskUseCases;
    approvalUseCases: ApprovalUseCases;
"""
content = content.replace("export interface ApplicationUseCases {", "export interface ApplicationUseCases {" + use_cases_def)

# Add to register method
registration = """
        const workflowOrchestrator = new WorkflowOrchestrator(r.workflowDefinition as any, r.workflowInstance as any, e);
        const taskUseCases = new TaskUseCases(r.workflowInstance as any, e);
        const approvalUseCases = new ApprovalUseCases(r.workflowInstance as any, workflowOrchestrator);

        this.state = {
            ...this.state,
            workflowOrchestrator,
            taskUseCases,
            approvalUseCases
        };

        for (const [name, useCase] of Object.entries(this.state)) {
"""
content = content.replace("for (const [name, useCase] of Object.entries(this.state)) {", registration)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
