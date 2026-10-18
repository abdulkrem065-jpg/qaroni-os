import { ValidationError } from '../../shared/errors/ValidationError';
export type CategoryType = 'ACCOUNTING_EQUATION' | 'TRIAL_BALANCE' | 'LEDGER_INTEGRITY' | 'CHART_OF_ACCOUNTS' | 'POSTING_INTEGRITY' | 'BALANCE_SHEET' | 'PERIOD_INTEGRITY' | 'CURRENCY' | 'BRANCH' | 'ALL';
export class ValidationCategory {
    public readonly value: CategoryType;
    constructor(value: string) {
        const valid = ['ACCOUNTING_EQUATION', 'TRIAL_BALANCE', 'LEDGER_INTEGRITY', 'CHART_OF_ACCOUNTS', 'POSTING_INTEGRITY', 'BALANCE_SHEET', 'PERIOD_INTEGRITY', 'CURRENCY', 'BRANCH', 'ALL'];
        if (!valid.includes(value)) {
            throw new ValidationError('Invalid ValidationCategory');
        }
        this.value = value as CategoryType;
        Object.freeze(this);
    }
}
