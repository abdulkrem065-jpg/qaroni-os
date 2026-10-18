import os

with open('src/application/accounting/usecases/AccountingCycleUseCases.ts', 'r') as f:
    content = f.read()

# Update JournalLine.create
old_jl = """        const journalLines = openingLines.map((l, index) => JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            new AccountId(l.accountId),
            new DebitAmount(l.debit),
            new CreditAmount(l.credit),
            `Opening Balance - Line ${index + 1}`
        ));"""

new_jl = """        const journalLines = openingLines.map((l, index) => JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            new AccountId(l.accountId),
            new JournalDescription(`Opening Balance - Line ${index + 1}`),
            new DebitAmount(l.debit),
            new CreditAmount(l.credit),
            'BASE_CURRENCY' // Assuming a default currency
        ));"""

content = content.replace(old_jl, new_jl)

# Update Journal.create
old_j = """        const startDate = new Date(dto.newFiscalYearStartDate);
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber(`OPEN-${closedFy.year + 1}`),
            new JournalDescription(`Opening Balances for ${closedFy.year + 1}`),
            new PostingDate(startDate),
            new AccountingDate(startDate),
            undefined,
            journalLines
        );"""

new_j = """        const startDate = new Date(dto.newFiscalYearStartDate);
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber(`OPEN-${closedFy.year + 1}`),
            new JournalDescription(`Opening Balances for ${closedFy.year + 1}`),
            new PostingDate(startDate),
            new AccountingDate(startDate),
            undefined as any
        );

        for (const line of journalLines) {
            journal.addLine(line);
        }"""

content = content.replace(old_j, new_j)

with open('src/application/accounting/usecases/AccountingCycleUseCases.ts', 'w') as f:
    f.write(content)
