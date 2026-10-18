import { AuthenticationVerifier } from '../validators/AuthenticationVerifier';
import { CredentialValidator } from '../validators/CredentialValidator';
import { SessionCreationService } from './SessionCreationService';
import { SessionTerminationService } from './SessionTerminationService';
import { RefreshTokenService } from './RefreshTokenService';
import { AccessTokenFactory } from '../interfaces/AccessTokenFactory';
import { RefreshTokenFactory } from '../interfaces/RefreshTokenFactory';
import { AuthenticationResult } from '../models/AuthenticationResult';
import { AuthenticationContext } from '../models/AuthenticationContext';
import { IEventBus } from '../../ports/IEventBus';
import { AuthenticationSucceeded, AuthenticationFailed } from '../../../domain/iam/events/IamDomainEvents';

export class AuthenticationService {
    constructor(
        private verifier: AuthenticationVerifier,
        private credentialValidator: CredentialValidator,
        private sessionCreation: SessionCreationService,
        private sessionTermination: SessionTerminationService,
        private refreshTokenService: RefreshTokenService,
        private accessTokenFactory: AccessTokenFactory,
        private refreshTokenFactory: RefreshTokenFactory,
        private eventBus: IEventBus
    ) {}

    public async login(email: string, passwordPlain: string): Promise<AuthenticationResult> {
        try {
            const user = await this.verifier.verifyIdentity(email);

            const isCredentialValid = await this.credentialValidator.validate(user.id.value, passwordPlain);
            if (!isCredentialValid) {
                await this.eventBus.publish(new AuthenticationFailed(email, 'Invalid password or credential inactive'));
                return AuthenticationResult.failure('Invalid credentials');
            }

            // Credential verified, user and tenant verified
            // TTL 7 days for session
            const sessionId = await this.sessionCreation.createSession(user.id.value, 7 * 24 * 3600);

            const context = new AuthenticationContext(
                user.id.value,
                user.organizationId.value,
                undefined,
                sessionId
            );

            const accessToken = await this.accessTokenFactory.create(context);
            const refreshToken = await this.refreshTokenFactory.create(context);

            await this.eventBus.publish(new AuthenticationSucceeded(user.id.value, user.organizationId.value));

            return AuthenticationResult.success(accessToken, refreshToken);
        } catch (error) {
            await this.eventBus.publish(new AuthenticationFailed(email, error instanceof Error ? error.message : 'Unknown error'));
            return AuthenticationResult.failure(error instanceof Error ? error.message : 'Authentication failed');
        }
    }

    public async logout(sessionId: string): Promise<void> {
        await this.sessionTermination.terminate(sessionId);
    }

    public async refreshSession(sessionId: string): Promise<AuthenticationResult> {
        try {
            // New TTL 7 days
            const { newSessionId, userId } = await this.refreshTokenService.refresh(sessionId, 7 * 24 * 3600);
            
            const user = await this.verifier.verifyIdentityById(userId);

            const context = new AuthenticationContext(
                user.id.value,
                user.organizationId.value,
                undefined,
                newSessionId
            );

            const accessToken = await this.accessTokenFactory.create(context);
            const refreshToken = await this.refreshTokenFactory.create(context);

            return AuthenticationResult.success(accessToken, refreshToken);
        } catch (error) {
            return AuthenticationResult.failure(error instanceof Error ? error.message : 'Refresh failed');
        }
    }
}
