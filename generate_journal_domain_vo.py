import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/domain/accounting/valueobjects/JournalId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class JournalId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/JournalEntryId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class JournalEntryId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/JournalLineId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class JournalLineId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/JournalNumber.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class JournalNumber {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('JournalNumber cannot be empty');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/JournalDescription.ts', """export class JournalDescription {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '';
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/DebitAmount.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class DebitAmount {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('DebitAmount cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/CreditAmount.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class CreditAmount {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('CreditAmount cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/JournalStatus.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type JournalStatusType = 'DRAFT' | 'READY_FOR_APPROVAL' | 'APPROVED' | 'REJECTED' | 'POSTED' | 'REVERSED' | 'CANCELLED';
export class JournalStatus {
    public readonly value: JournalStatusType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        const validStatuses = ['DRAFT', 'READY_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED', 'REVERSED', 'CANCELLED'];
        if (!validStatuses.includes(upper)) throw new ValidationError('Invalid JournalStatus');
        this.value = upper as JournalStatusType;
        Object.freeze(this);
    }
    public canModify(): boolean {
        return this.value === 'DRAFT' || this.value === 'REJECTED';
    }
    public isApproved(): boolean {
        return this.value === 'APPROVED';
    }
    public isPosted(): boolean {
        return this.value === 'POSTED';
    }
}
""")

create_file('src/domain/accounting/valueobjects/PostingDate.ts', """export class PostingDate {
    public readonly value: Date;
    constructor(value: Date | string) {
        this.value = new Date(value);
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountingDate.ts', """export class AccountingDate {
    public readonly value: Date;
    constructor(value: Date | string) {
        this.value = new Date(value);
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/ReferenceNumber.ts', """export class ReferenceNumber {
    public readonly value: string;
    constructor(value?: string | null) {
        this.value = value ? value.trim() : '';
        Object.freeze(this);
    }
}
""")

print("Journal VOs created")
