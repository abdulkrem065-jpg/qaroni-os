import { CredentialId } from '../value-objects/CredentialId';
import { UserId } from '../value-objects/UserId';
import { PasswordHash } from '../value-objects/PasswordHash';

export class Credential {
    constructor(
        public readonly id: CredentialId,
        public readonly userId: UserId,
        private _passwordHash: PasswordHash,
        private _isActive: boolean = true
    ) {}

    get passwordHash(): PasswordHash {
        return this._passwordHash;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    public updatePassword(newHash: PasswordHash): void {
        this._passwordHash = newHash;
    }

    public deactivate(): void {
        this._isActive = false;
    }
}
