with open('src/domain/iam/aggregates/Role.ts', 'r') as f:
    content = f.read()

content = content.replace("private _name: string;", "private _name: string;\n    private _description: string;")
content = content.replace("private constructor(id: RoleId, organizationId: OrganizationId, name: string, permissionIds: PermissionId[])", "private constructor(id: RoleId, organizationId: OrganizationId, name: string, permissionIds: PermissionId[], description: string = '')")
content = content.replace("this._name = name;", "this._name = name;\n        this._description = description;")
content = content.replace("public static create(id: RoleId, organizationId: OrganizationId, name: string): Role {", "public static create(id: RoleId, organizationId: OrganizationId, name: string, description: string = ''): Role {")
content = content.replace("const role = new Role(id, organizationId, name.trim(), []);", "const role = new Role(id, organizationId, name.trim(), [], description);")
content = content.replace("public get name(): string { return this._name; }", "public get name(): string { return this._name; }\n    public get description(): string { return this._description; }")

with open('src/domain/iam/aggregates/Role.ts', 'w') as f:
    f.write(content)

