with open('src/domain/iam/aggregates/User.ts', 'r') as f:
    content = f.read()

methods = """
    public activate(): void { this._isActive = true; }
    public suspend(): void { this._isActive = false; }
    public delete(): void { this._isActive = false; }
    public updateEmail(email: EmailAddress): void { this._email = email; }
    public updateUsername(name: PersonName): void { this._name = name; }
"""

content = content.replace("public assignRole", methods + "\n    public assignRole")
with open('src/domain/iam/aggregates/User.ts', 'w') as f:
    f.write(content)

