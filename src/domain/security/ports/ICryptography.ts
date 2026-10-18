export interface IEncryptionService {
    encrypt(plaintext: string): Promise<string>;
    decrypt(ciphertext: string): Promise<string>;
}

export interface ISecureRandomGenerator {
    generateBytes(length: number): string;
    generateString(length: number): string;
}

export interface ISignatureService {
    sign(data: string): Promise<string>;
    verify(data: string, signature: string): Promise<boolean>;
}
