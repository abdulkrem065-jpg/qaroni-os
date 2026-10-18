with open('src/application/ports/IEventBus.ts', 'r') as f:
    content = f.read()

content = content.replace("events: DomainEvent[]", "events: ReadonlyArray<any>")
content = content.replace("event: DomainEvent", "event: any")

with open('src/application/ports/IEventBus.ts', 'w') as f:
    f.write(content)

