import { DebitAmount } from './DebitAmount';
import { CreditAmount } from './CreditAmount';

export class AccountBalance {
    constructor(
        public readonly debit: DebitAmount,
        public readonly credit: CreditAmount
    ) {
        Object.freeze(this);
    }
}
