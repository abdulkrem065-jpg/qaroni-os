import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { SupabaseJournalLineRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalLineRepository';",
    "import { SupabaseJournalLineRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalLineRepository';\nimport { SupabasePostingRepository } from '../../infrastructure/accounting/repositories/SupabasePostingRepository';"
)

content = content.replace(
    "journalLine: new SupabaseJournalLineRepository(db)",
    "journalLine: new SupabaseJournalLineRepository(db),\n            posting: new SupabasePostingRepository(db)"
)

content = content.replace(
    "journalUseCases: new JournalUseCases(r.journal, r.journalLine, e),",
    "journalUseCases: new JournalUseCases(r.journal, r.journalLine, e),\n            postingUseCases: new PostingUseCases(r.posting, r.journal, e),"
)

content = content.replace(
    "import { JournalUseCases } from '../../application/accounting/usecases/JournalUseCases';",
    "import { JournalUseCases } from '../../application/accounting/usecases/JournalUseCases';\nimport { PostingUseCases } from '../../application/accounting/usecases/PostingUseCases';"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)

print("Composer patched for posting")
