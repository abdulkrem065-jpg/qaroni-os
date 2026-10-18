import os

with open('src/application/accounting/services/FinancialSnapshotGenerator.ts', 'r') as f:
    content = f.read()

content = content.replace("await this.cfUseCases.getCashFlowStatement", "await this.cfUseCases.getCashFlow")

with open('src/application/accounting/services/FinancialSnapshotGenerator.ts', 'w') as f:
    f.write(content)
