import { IPasswordHasher, IPasswordPolicy } from '../../../domain/security/ports/IPasswordInfrastructure';
import bcrypt from 'bcryptjs';

export class LocalPasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 12;

    public async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    public async verify(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}

export class DefaultPasswordPolicy implements IPasswordPolicy {
    public validate(password: string): boolean {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    }

    public getRules(): string[] {
        return [
            'Minimum 8 characters',
            'At least one uppercase letter',
            'At least one lowercase letter',
            'At least one number'
        ];
    }
}
