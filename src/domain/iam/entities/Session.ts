import { SessionId } from '../value-objects/SessionId';
import { UserId } from '../value-objects/UserId';

export class Session {
    constructor(
        public readonly id: SessionId,
        public readonly userId: UserId,
        public readonly issuedAt: Date,
        public readonly expiresAt: Date,
        private _isRevoked: boolean = false
    ) {}

    get isRevoked(): boolean {
        return this._isRevoked;
    }

    public revoke(): void {
        this._isRevoked = true;
    }

    public isExpired(): boolean {
        return new Date() > this.expiresAt;
    }
    
    public isValid(): boolean {
        return !this.isRevoked && !this.isExpired();
    }
}
