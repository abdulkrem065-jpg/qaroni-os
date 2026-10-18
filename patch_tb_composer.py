import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { SupabaseLedgerBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerBalanceRepository';",
    "import { SupabaseLedgerBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerBalanceRepository';\nimport { SupabaseTrialBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseTrialBalanceRepository';\nimport { SupabaseLedgerEntryQuery } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryQuery';"
)

content = content.replace(
    "ledgerBalance: new SupabaseLedgerBalanceRepository(db)",
    "ledgerBalance: new SupabaseLedgerBalanceRepository(db),\n            trialBalance: new SupabaseTrialBalanceRepository(db),\n            ledgerEntryQuery: new SupabaseLedgerEntryQuery(db)"
)

content = content.replace(
    "import { GeneralLedgerUseCases } from '../../application/accounting/usecases/GeneralLedgerUseCases';",
    "import { GeneralLedgerUseCases } from '../../application/accounting/usecases/GeneralLedgerUseCases';\nimport { TrialBalanceUseCases } from '../../application/accounting/usecases/TrialBalanceUseCases';"
)

content = content.replace(
    "generalLedgerUseCases: new GeneralLedgerUseCases(r.ledgerEntry, r.ledgerBalance, r.posting, r.journal, r.journalLine, e),",
    "generalLedgerUseCases: new GeneralLedgerUseCases(r.ledgerEntry, r.ledgerBalance, r.posting, r.journal, r.journalLine, e),\n            trialBalanceUseCases: new TrialBalanceUseCases(r.trialBalance, r.ledgerEntryQuery),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
print("Composer patched for Trial Balance")
