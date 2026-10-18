with open('src/application/authentication/validators/AuthenticationVerifier.ts', 'r') as f:
    content = f.read()
if "import { UserId }" not in content:
    content = "import { UserId } from '../../../../domain/iam/valueobjects/UserId';\n" + content
    with open('src/application/authentication/validators/AuthenticationVerifier.ts', 'w') as f:
        f.write(content)
