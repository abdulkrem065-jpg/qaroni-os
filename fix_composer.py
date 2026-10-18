import os

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    content = f.read()

content = content.replace("import { JournalUseCases }\nimport { AccountingCycleUseCases } from '../accounting/usecases/AccountingCycleUseCases'; from '../../application/accounting/usecases/JournalUseCases';", "import { JournalUseCases } from '../../application/accounting/usecases/JournalUseCases';\nimport { AccountingCycleUseCases } from '../../application/accounting/usecases/AccountingCycleUseCases';")

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(content)
