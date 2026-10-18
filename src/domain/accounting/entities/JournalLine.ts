import { Entity } from '../../shared/core/Entity';
import { JournalLineId } from '../valueobjects/JournalLineId';
import { AccountId } from '../valueobjects/AccountId';
import { JournalDescription } from '../valueobjects/JournalDescription';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class JournalLine extends Entity<JournalLineId> {
    private constructor(
        id: JournalLineId,
        private _accountId: AccountId,
        private _description: JournalDescription,
        private _debit: DebitAmount,
        private _credit: CreditAmount,
        private _currencyId: string,
        private _costCenterId?: string,
        private _branchId?: string,
        private _customerId?: string,
        private _supplierId?: string
    ) {
        super(id);
        this.validateAmount();
    }

    public static create(
        id: JournalLineId,
        accountId: AccountId,
        description: JournalDescription,
        debit: DebitAmount,
        credit: CreditAmount,
        currencyId: string,
        costCenterId?: string,
        branchId?: string,
        customerId?: string,
        supplierId?: string
    ): JournalLine {
        return new JournalLine(id, accountId, description, debit, credit, currencyId, costCenterId, branchId, customerId, supplierId);
    }

    private validateAmount(): void {
        const hasDebit = this._debit.value > 0;
        const hasCredit = this._credit.value > 0;

        if (hasDebit && hasCredit) {
            throw new BusinessRuleError('Journal Line cannot contain both Debit and Credit amounts');
        }
        if (!hasDebit && !hasCredit) {
            throw new BusinessRuleError('Journal Line must have either Debit or Credit amount greater than zero');
        }
    }

    public get accountId(): AccountId { return this._accountId; }
    public get description(): JournalDescription { return this._description; }
    public get debit(): DebitAmount { return this._debit; }
    public get credit(): CreditAmount { return this._credit; }
    public get currencyId(): string { return this._currencyId; }
    public get costCenterId(): string | undefined { return this._costCenterId; }
    public get branchId(): string | undefined { return this._branchId; }
    public get customerId(): string | undefined { return this._customerId; }
    public get supplierId(): string | undefined { return this._supplierId; }
}
