def fix_file(file, entity_id_type):
    with open(file, 'r') as f:
        content = f.read()
    content = content.replace(f"id: {entity_id_type}", f"id: {entity_id_type} | string")
    
    with open(file, 'w') as f:
        f.write(content)

fix_file('src/domain/iam/repositories/IUserRepository.ts', 'UserId')
fix_file('src/domain/iam/repositories/IRoleRepository.ts', 'RoleId')
fix_file('src/domain/iam/repositories/IPermissionRepository.ts', 'PermissionId')
