import { ValidationError } from '../errors/ValidationError';
export class SupplierContact {
    public readonly phone: string;
    public readonly email: string;
    public readonly address: string;
    private constructor(phone: string, email: string, address: string) {
        this.phone = phone;
        this.email = email;
        this.address = address;
        Object.freeze(this);
    }
    public static create(phone: string, email: string, address: string): SupplierContact {
        return new SupplierContact(phone.trim(), email.trim(), address.trim());
    }
}
