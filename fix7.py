with open('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'r') as f:
    content = f.read()

content = content.replace("findAll(): Promise<Role[]>", "findAll(organizationId?: string): Promise<Role[]>")
content = content.replace("from('roles')", "from('roles')\n            if (organizationId) query = query.eq('organization_id', organizationId);")

with open('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'w') as f:
    f.write(content.replace("const { data, error } = await this.supabase\n                .from('roles')\n            if (organizationId) query = query.eq('organization_id', organizationId);\n                .select('*, role_permissions(permission_id)');", 
    "let query = this.supabase.from('roles').select('*, role_permissions(permission_id)');\n            if (organizationId) query = query.eq('organization_id', organizationId);\n            const { data, error } = await query;"))

with open('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'r') as f:
    content = f.read()

content = content.replace("findAll(): Promise<User[]>", "findAll(organizationId?: string): Promise<User[]>")
content = content.replace("const { data, error } = await this.supabase\n                .from('users')\n                .select('*, user_roles(role_id)');", 
    "let query = this.supabase.from('users').select('*, user_roles(role_id)');\n            if (organizationId) query = query.eq('organization_id', organizationId);\n            const { data, error } = await query;")

with open('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'w') as f:
    f.write(content)

