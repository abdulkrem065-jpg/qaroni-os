import os

with open('src/domain/accounting/aggregates/PostingBatch.ts', 'r') as f:
    content = f.read()

content = content.replace("import { JournalId } from '../valueobjects/JournalId';", "import { JournalId } from '../valueobjects/JournalId';\nimport { PostingId } from '../valueobjects/PostingId';")
content = content.replace("new (require('../valueobjects/PostingId').PostingId)(transactionId)", "new PostingId(transactionId)")

with open('src/domain/accounting/aggregates/PostingBatch.ts', 'w') as f:
    f.write(content)

print("PostingBatch patched")
