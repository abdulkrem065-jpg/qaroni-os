import os

# fix WorkflowEvents.ts
with open('src/domain/workflow/events/WorkflowEvents.ts', 'r') as f:
    content = f.read()
content = content.replace('dateTimeOccurred: Date', 'occurredOn: Date')
content = content.replace('this.dateTimeOccurred = new Date()', 'this.occurredOn = new Date()')
content = content.replace('export class WorkflowStartedEvent implements IDomainEvent {', 'export class WorkflowStartedEvent implements IDomainEvent {\n    public eventName = "WorkflowStartedEvent";')
content = content.replace('export class WorkflowTransitionedEvent implements IDomainEvent {', 'export class WorkflowTransitionedEvent implements IDomainEvent {\n    public eventName = "WorkflowTransitionedEvent";')
content = content.replace('export class WorkflowCompletedEvent implements IDomainEvent {', 'export class WorkflowCompletedEvent implements IDomainEvent {\n    public eventName = "WorkflowCompletedEvent";')
content = content.replace('export class WorkflowTaskCreatedEvent implements IDomainEvent {', 'export class WorkflowTaskCreatedEvent implements IDomainEvent {\n    public eventName = "WorkflowTaskCreatedEvent";')
content = content.replace('export class WorkflowTaskCompletedEvent implements IDomainEvent {', 'export class WorkflowTaskCompletedEvent implements IDomainEvent {\n    public eventName = "WorkflowTaskCompletedEvent";')
content = content.replace('export class WorkflowRejectedEvent implements IDomainEvent {', 'export class WorkflowRejectedEvent implements IDomainEvent {\n    public eventName = "WorkflowRejectedEvent";')

with open('src/domain/workflow/events/WorkflowEvents.ts', 'w') as f:
    f.write(content)

# fix WorkflowBuilder.ts EntityId constructor
with open('src/domain/workflow/services/WorkflowBuilder.ts', 'r') as f:
    content = f.read()
content = content.replace('new WorkflowId(crypto.randomUUID())', 'new WorkflowId(crypto.randomUUID())') 
# wait EntityId constructor is NOT private, but TS said constructor of WorkflowId is private.
# Let's check how other Ids are defined.
