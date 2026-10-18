import os

with open('src/application/ports/IEventBus.ts', 'r') as f:
    content = f.read()

new_content = """
export interface IEventHandler<T = any> {
    eventName: string;
    handle(event: T): Promise<void>;
}

"""

if 'IEventHandler' not in content:
    content = new_content + content
    content = content.replace(
        "publishAll(events: ReadonlyArray<any>): Promise<void>;",
        "publishAll(events: ReadonlyArray<any>): Promise<void>;\n    subscribe?(handler: IEventHandler): void;"
    )
    with open('src/application/ports/IEventBus.ts', 'w') as f:
        f.write(content)
