import re

with open('src/domain/customer/events/CustomerEvents.ts', 'r') as f:
    content = f.read()

content = content.replace("public readonly occurredOn: Date;", "public readonly occurredOn: Date;\n    public readonly eventName: string;")
content = content.replace("this.occurredOn = new Date();", "this.occurredOn = new Date();\n        this.eventName = this.constructor.name;")

with open('src/domain/customer/events/CustomerEvents.ts', 'w') as f:
    f.write(content)
