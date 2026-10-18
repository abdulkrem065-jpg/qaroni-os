export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
}

export interface IPasswordPolicy {
    validate(password: string): boolean;
    getRules(): string[];
}
