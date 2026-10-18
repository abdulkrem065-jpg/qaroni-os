import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/TrialBalanceId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class TrialBalanceId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/TrialBalancePeriodType.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type PeriodType = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
export class TrialBalancePeriodType {
    public readonly value: PeriodType;
    constructor(value: string) {
        if (!['DAILY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'].includes(value)) {
            throw new ValidationError('Invalid TrialBalancePeriodType');
        }
        this.value = value as PeriodType;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/TrialBalancePeriod.ts', """import { TrialBalancePeriodType } from './TrialBalancePeriodType';
import { ValidationError } from '../../shared/errors/ValidationError';

export class TrialBalancePeriod {
    constructor(
        public readonly type: TrialBalancePeriodType,
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('StartDate cannot be after EndDate');
        }
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/DebitTotal.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class DebitTotal {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('DebitTotal cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/CreditTotal.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class CreditTotal {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('CreditTotal cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/AccountBalance.ts', """import { DebitAmount } from './DebitAmount';
import { CreditAmount } from './CreditAmount';

export class AccountBalance {
    constructor(
        public readonly debit: DebitAmount,
        public readonly credit: CreditAmount
    ) {
        Object.freeze(this);
    }
}
""")

# Entities
create_file('src/domain/accounting/entities/TrialBalanceAccount.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';
import { AccountBalance } from '../valueobjects/AccountBalance';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';

export class TrialBalanceAccount extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId,
        private readonly _balance: AccountBalance,
        private readonly _accountNumber: string,
        private readonly _accountName: string
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId,
        debit: number,
        credit: number,
        accountNumber: string,
        accountName: string
    ): TrialBalanceAccount {
        return new TrialBalanceAccount(
            id,
            accountId,
            new AccountBalance(new DebitAmount(debit), new CreditAmount(credit)),
            accountNumber,
            accountName
        );
    }

    public static load(
        id: EntityId,
        accountId: AccountId,
        debit: number,
        credit: number,
        accountNumber: string,
        accountName: string
    ): TrialBalanceAccount {
        return new TrialBalanceAccount(
            id,
            accountId,
            new AccountBalance(new DebitAmount(debit), new CreditAmount(credit)),
            accountNumber,
            accountName
        );
    }

    public get accountId(): AccountId { return this._accountId; }
    public get balance(): AccountBalance { return this._balance; }
    public get accountNumber(): string { return this._accountNumber; }
    public get accountName(): string { return this._accountName; }
}
""")

# Aggregates
create_file('src/domain/accounting/aggregates/TrialBalance.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TrialBalancePeriod } from '../valueobjects/TrialBalancePeriod';
import { DebitTotal } from '../valueobjects/DebitTotal';
import { CreditTotal } from '../valueobjects/CreditTotal';
import { TrialBalanceAccount } from '../entities/TrialBalanceAccount';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { EntityId } from '../../shared/valueobjects/EntityId';
import * as crypto from 'crypto';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';

export class TrialBalance extends AggregateRoot<TrialBalanceId> {
    private constructor(
        id: TrialBalanceId,
        private readonly _organizationId: OrganizationId,
        private readonly _period: TrialBalancePeriod,
        private _accounts: TrialBalanceAccount[],
        private readonly _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: TrialBalanceId,
        organizationId: OrganizationId,
        period: TrialBalancePeriod,
        accounts: TrialBalanceAccount[]
    ): TrialBalance {
        const tb = new TrialBalance(id, organizationId, period, accounts, new Date());
        tb.validateBalance();
        return tb;
    }

    public static load(
        id: TrialBalanceId,
        organizationId: OrganizationId,
        period: TrialBalancePeriod,
        accounts: TrialBalanceAccount[],
        generatedAt: Date
    ): TrialBalance {
        return new TrialBalance(id, organizationId, period, accounts, generatedAt);
    }

    public validateBalance(): void {
        const totalDebit = this.calculateTotalDebit();
        const totalCredit = this.calculateTotalCredit();

        // Use a small epsilon to account for floating point errors if needed, but here we assume exact math or cents integer
        if (Math.abs(totalDebit.value - totalCredit.value) > 0.001) {
            throw new BusinessRuleError(`Trial Balance Imbalance Detected: Debit (${totalDebit.value}) != Credit (${totalCredit.value})`);
        }
    }

    public calculateTotalDebit(): DebitTotal {
        const total = this._accounts.reduce((sum, acc) => sum + acc.balance.debit.value, 0);
        return new DebitTotal(total);
    }

    public calculateTotalCredit(): CreditTotal {
        const total = this._accounts.reduce((sum, acc) => sum + acc.balance.credit.value, 0);
        return new CreditTotal(total);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get period(): TrialBalancePeriod { return this._period; }
    public get accounts(): ReadonlyArray<TrialBalanceAccount> { return this._accounts; }
    public get generatedAt(): Date { return this._generatedAt; }
}
""")

print("Trial Balance Domain generated")
