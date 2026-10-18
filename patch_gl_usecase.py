import os

with open('src/application/accounting/usecases/GeneralLedgerUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "const lines = await this.journalLineRepo.findByJournalId(tx.journalId, organizationId);",
    "const lines = await this.journalLineRepo.findByJournalId(tx.journalId);"
)

with open('src/application/accounting/usecases/GeneralLedgerUseCases.ts', 'w') as f:
    f.write(content)
