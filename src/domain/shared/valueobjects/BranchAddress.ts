import { ValidationError } from '../errors/ValidationError';

export class BranchAddress {
    public readonly street: string;
    public readonly city: string;
    public readonly state: string;
    public readonly country: string;
    public readonly postalCode: string;

    private constructor(street: string, city: string, state: string, country: string, postalCode: string) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.country = country;
        this.postalCode = postalCode;
        Object.freeze(this);
    }

    public static create(street: string, city: string, state: string, country: string, postalCode: string): BranchAddress {
        if (!street || !city || !state || !country || !postalCode) {
            throw new ValidationError('All address fields must be provided');
        }
        return new BranchAddress(
            street.trim(),
            city.trim(),
            state.trim(),
            country.trim(),
            postalCode.trim()
        );
    }

    public equals(other: BranchAddress | null | undefined): boolean {
        if (!other) return false;
        return this.street === other.street && 
               this.city === other.city && 
               this.state === other.state && 
               this.country === other.country && 
               this.postalCode === other.postalCode;
    }
}
