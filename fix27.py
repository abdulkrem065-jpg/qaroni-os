import re

def replace_in_file(file, old, new):
    with open(file, 'r') as f:
        content = f.read()
    with open(file, 'w') as f:
        f.write(content.replace(old, new))

# AuthenticationVerifier
replace_in_file('src/application/authentication/validators/AuthenticationVerifier.ts', 'if (undefined) {\n            const isBranchActive = await this.branchVerification.isBranchActive(undefined.value);\n            if (!isBranchActive) {\n                throw new ApplicationError(\'Branch is not active\');\n            }\n        }', '')

# CreateUserUseCase
replace_in_file('src/application/usecases/iam/user/CreateUserUseCase.ts', 'branchId ? new BranchId(branchId) : undefined', '')
replace_in_file('src/application/usecases/iam/user/CreateUserUseCase.ts', 'new Username(username),', 'new PersonName(username, username)')
replace_in_file('src/application/usecases/iam/user/CreateUserUseCase.ts', 'new Email(email),', 'new EmailAddress(email),')

