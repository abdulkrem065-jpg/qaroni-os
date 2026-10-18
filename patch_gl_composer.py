import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { SupabasePostingRepository } from '../../infrastructure/accounting/repositories/SupabasePostingRepository';",
    "import { SupabasePostingRepository } from '../../infrastructure/accounting/repositories/SupabasePostingRepository';\nimport { SupabaseLedgerEntryRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryRepository';\nimport { SupabaseLedgerBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerBalanceRepository';"
)

content = content.replace(
    "posting: new SupabasePostingRepository(db)",
    "posting: new SupabasePostingRepository(db),\n            ledgerEntry: new SupabaseLedgerEntryRepository(db),\n            ledgerBalance: new SupabaseLedgerBalanceRepository(db)"
)

content = content.replace(
    "import { PostingUseCases } from '../../application/accounting/usecases/PostingUseCases';",
    "import { PostingUseCases } from '../../application/accounting/usecases/PostingUseCases';\nimport { GeneralLedgerUseCases } from '../../application/accounting/usecases/GeneralLedgerUseCases';\nimport { PostingCompletedEventHandler } from '../../application/accounting/events/GeneralLedgerEventHandlers';"
)

content = content.replace(
    "postingUseCases: new PostingUseCases(r.posting, r.journal, e),",
    "postingUseCases: new PostingUseCases(r.posting, r.journal, e),\n            generalLedgerUseCases: new GeneralLedgerUseCases(r.ledgerEntry, r.ledgerBalance, r.posting, r.journal, r.journalLine, e),"
)

subscribe_logic = """
        const postingCompletedHandler = new PostingCompletedEventHandler(useCases.generalLedgerUseCases);
        e.subscribe(postingCompletedHandler);

        return useCases;
"""

content = content.replace("return useCases;", subscribe_logic)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
print("Composer patched for General Ledger")
