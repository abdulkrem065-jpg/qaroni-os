import { IEncryptionService, ISecureRandomGenerator, ISignatureService } from '../../../domain/security/ports/ICryptography';
import crypto from 'crypto';

export class LocalEncryptionService implements IEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    
    // Default encryption key should be injected via Configuration in production
    private getKey(): Buffer {
        const keyString = process.env.ENCRYPTION_KEY || 'default_32_byte_secret_key_for_db_000';
        return crypto.createHash('sha256').update(String(keyString)).digest();
    }

    public async encrypt(plaintext: string): Promise<string> {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.getKey(), iv);
        
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        // Format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    public async decrypt(ciphertext: string): Promise<string> {
        const parts = ciphertext.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid ciphertext format');
        }
        
        const [ivHex, authTagHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(this.algorithm, this.getKey(), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

export class LocalSecureRandomGenerator implements ISecureRandomGenerator {
    public generateBytes(length: number): string {
        return crypto.randomBytes(length).toString('hex');
    }

    public generateString(length: number): string {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
}

export class LocalSignatureService implements ISignatureService {
    private getKey(): string {
        return process.env.SIGNATURE_SECRET || 'default_signature_secret_for_qeos_123';
    }

    public async sign(data: string): Promise<string> {
        return crypto.createHmac('sha256', this.getKey()).update(data).digest('hex');
    }

    public async verify(data: string, signature: string): Promise<boolean> {
        const expectedSignature = await this.sign(data);
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
}
