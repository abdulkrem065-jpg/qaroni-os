import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { SupabaseAccountRepository } from '../../infrastructure/accounting/repositories/SupabaseAccountRepository';", "import { SupabaseAccountRepository } from '../../infrastructure/accounting/repositories/SupabaseAccountRepository';\nimport { SupabaseJournalRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalRepository';\nimport { SupabaseJournalLineRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalLineRepository';")

content = content.replace("account: new SupabaseAccountRepository(db)", "account: new SupabaseAccountRepository(db),\n            journal: new SupabaseJournalRepository(db),\n            journalLine: new SupabaseJournalLineRepository(db)")

content = content.replace("accountUseCases: new AccountUseCases(r.account, e),", "accountUseCases: new AccountUseCases(r.account, e),\n            journalUseCases: new JournalUseCases(r.journal, r.journalLine, e),")

content = content.replace("import { AccountUseCases } from '../../application/accounting/usecases/AccountUseCases';", "import { AccountUseCases } from '../../application/accounting/usecases/AccountUseCases';\nimport { JournalUseCases } from '../../application/accounting/usecases/JournalUseCases';")

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)

print("Composer patched for journal")
