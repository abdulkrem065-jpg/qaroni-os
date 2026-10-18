import os

with open('src/domain/accounting/aggregates/Account.ts', 'r') as f:
    content = f.read()

content = content.replace("import { PostingStatus } from '../valueobjects/PostingStatus';", "import { AccountStatus } from '../valueobjects/AccountStatus';")
content = content.replace("private _status: PostingStatus,", "private _status: AccountStatus,")
content = content.replace("new PostingStatus('ACTIVE')", "new AccountStatus('ACTIVE')")
content = content.replace("new PostingStatus('ARCHIVED')", "new AccountStatus('ARCHIVED')")
content = content.replace("status: PostingStatus", "status: AccountStatus")
content = content.replace("public get status(): PostingStatus", "public get status(): AccountStatus")

with open('src/domain/accounting/aggregates/Account.ts', 'w') as f:
    f.write(content)

with open('src/domain/accounting/aggregates/Account.spec.ts', 'r') as f:
    content = f.read()

content = content.replace("import { PostingStatus } from '../valueobjects/PostingStatus';", "import { AccountStatus } from '../valueobjects/AccountStatus';")

with open('src/domain/accounting/aggregates/Account.spec.ts', 'w') as f:
    f.write(content)

with open('src/infrastructure/accounting/repositories/SupabaseAccountRepository.ts', 'r') as f:
    content = f.read()
    
content = content.replace("import { PostingStatus } from '../../../domain/accounting/valueobjects/PostingStatus';", "import { AccountStatus } from '../../../domain/accounting/valueobjects/AccountStatus';")
content = content.replace("new PostingStatus(row.status),", "new AccountStatus(row.status),")

with open('src/infrastructure/accounting/repositories/SupabaseAccountRepository.ts', 'w') as f:
    f.write(content)

print("Account patched to use AccountStatus")
