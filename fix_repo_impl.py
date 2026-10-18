def fix_impl(file, entity_id_type):
    with open(file, 'r') as f:
        content = f.read()
    
    content = content.replace(f"findById(id: {entity_id_type})", f"findById(id: {entity_id_type} | string)")
    content = content.replace(f"exists(id: {entity_id_type})", f"exists(id: {entity_id_type} | string)")
    content = content.replace(f"delete(id: {entity_id_type})", f"delete(id: {entity_id_type} | string)")
    
    # replace id.value with (typeof id === 'string' ? id : id.value)
    content = content.replace("id.value", "(typeof id === 'string' ? id : id.value)")
    
    # For save(user: User), user.id.value was also replaced! But user is User, not UserId | string.
    # user.id is UserId. We can replace (typeof user.id === 'string' ? user.id : user.id.value) with user.id.value
    content = content.replace("(typeof user.id === 'string' ? user.id : user.id.value)", "user.id.value")
    
    with open(file, 'w') as f:
        f.write(content)

fix_impl('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'UserId')
fix_impl('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'RoleId')
fix_impl('src/infrastructure/persistence/supabase/iam/SupabasePermissionRepository.ts', 'PermissionId')
