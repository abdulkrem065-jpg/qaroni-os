import os

with open('src/application/accounting/usecases/PostingUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace("journal.date", "journal.accountingDate.value")

with open('src/application/accounting/usecases/PostingUseCases.ts', 'w') as f:
    f.write(content)
