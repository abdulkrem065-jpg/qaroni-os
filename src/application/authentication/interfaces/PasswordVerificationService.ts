export interface PasswordVerificationService {
    verify(plainText: string, hash: string): Promise<boolean>;
}
