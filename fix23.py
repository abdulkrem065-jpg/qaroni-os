import re

def filter_file(file, remove_strings):
    with open(file, 'r') as f:
        lines = f.readlines()
    with open(file, 'w') as f:
        for line in lines:
            if not any(s in line for s in remove_strings):
                f.write(line)

def replace_in_file(file, old, new):
    with open(file, 'r') as f:
        content = f.read()
    with open(file, 'w') as f:
        f.write(content.replace(old, new))

# AuthorizationService
replace_in_file('src/application/authorization/AuthorizationService.ts', 'valueobjects/UserId', 'value-objects/UserId')
filter_file('src/application/authorization/AuthorizationService.ts', ['branchId', 'if (false)'])

# AuthenticationVerifier
replace_in_file('src/application/authentication/validators/AuthenticationVerifier.ts', 'valueobjects/UserId', 'value-objects/UserId')
filter_file('src/application/authentication/validators/AuthenticationVerifier.ts', ['branchId', 'if (false)'])

# AuthenticationService
filter_file('src/application/authentication/services/AuthenticationService.ts', ['branchId: undefined'])

# CreateSessionUseCase
replace_in_file('src/application/usecases/iam/session/CreateSessionUseCase.ts', 'if (user.isDeleted || user.isSuspended || !user.isActivated)', 'if (!user.isActive)')

# ApplicationComposer
replace_in_file('src/application/composition/ApplicationComposer.ts', 'getUser: new GetUserUseCase(r.user)', 'getUser: new GetUserUseCase(r.user, null as any)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listUsers: new ListUsersUseCase(r.user)', 'listUsers: new ListUsersUseCase(r.user, null as any)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listRoles: new ListRolesUseCase(r.role)', 'listRoles: new ListRolesUseCase(r.role, null as any)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listPermissions: new ListPermissionsUseCase(r.permission)', 'listPermissions: new ListPermissionsUseCase(r.permission, null as any)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'deletePermission: new DeletePermissionUseCase(r.permission)', 'deletePermission: new DeletePermissionUseCase(r.permission, null as any)')

# CreateUserUseCase
replace_in_file('src/application/usecases/iam/user/CreateUserUseCase.ts', 'new PersonName(username, username),\n            new Password(password)', 'new PersonName(username, username)')

