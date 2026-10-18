import { ValidationError } from '../../shared/errors/ValidationError';
export type BalanceSheetStatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export class BalanceSheetStatus {
    public readonly value: BalanceSheetStatusType;
    constructor(value: string) {
        if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value)) {
            throw new ValidationError('Invalid BalanceSheetStatus');
        }
        this.value = value as BalanceSheetStatusType;
        Object.freeze(this);
    }
}
