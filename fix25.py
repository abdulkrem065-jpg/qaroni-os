import re
def replace_in_file(file, old, new):
    with open(file, 'r') as f:
        content = f.read()
    with open(file, 'w') as f:
        f.write(content.replace(old, new))

# AuthenticationService
replace_in_file('src/application/authentication/services/AuthenticationService.ts', 'undefined?.value', 'undefined')

# AuthenticationVerifier
replace_in_file('src/application/authentication/validators/AuthenticationVerifier.ts', 'undefined?.value', 'undefined')
replace_in_file('src/application/authentication/validators/AuthenticationVerifier.ts', 'if (false) {} // ', '')

# AuthorizationService
replace_in_file('src/application/authorization/AuthorizationService.ts', '../../../domain/iam/value-objects/UserId', '../../domain/iam/value-objects/UserId')

# ApplicationComposer
replace_in_file('src/application/composition/ApplicationComposer.ts', 'getUser: new GetUserUseCase(r.user, null as any)', 'getUser: new GetUserUseCase(r.user)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listUsers: new ListUsersUseCase(r.user, null as any)', 'listUsers: new ListUsersUseCase(r.user)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listRoles: new ListRolesUseCase(r.role, null as any)', 'listRoles: new ListRolesUseCase(r.role)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'listPermissions: new ListPermissionsUseCase(r.permission, null as any)', 'listPermissions: new ListPermissionsUseCase(r.permission)')
replace_in_file('src/application/composition/ApplicationComposer.ts', 'deletePermission: new DeletePermissionUseCase(r.permission, null as any)', 'deletePermission: new DeletePermissionUseCase(r.permission)')

# CreateUserUseCase
# `CreateUserUseCase.ts(39,13): error TS2554: Expected 4 arguments, but got 5.`
replace_in_file('src/application/usecases/iam/user/CreateUserUseCase.ts', 'new PersonName(username, username),\n            new Password(password)', 'new PersonName(username, username)')

