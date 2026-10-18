import { ValidationError } from '../errors/ValidationError';
export class SupplierLegalInfo {
    public readonly taxNumber: string;
    public readonly commercialRegistration: string;
    private constructor(taxNumber: string, commercialRegistration: string) {
        this.taxNumber = taxNumber;
        this.commercialRegistration = commercialRegistration;
        Object.freeze(this);
    }
    public static create(taxNumber: string, commercialRegistration: string): SupplierLegalInfo {
        return new SupplierLegalInfo(taxNumber.trim(), commercialRegistration.trim());
    }
}
