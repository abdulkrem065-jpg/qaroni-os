import { IOAuthProvider, IOidcProvider, IIdentityProviderAdapter } from '../../../domain/security/ports/IOAuthProvider';

export abstract class AbstractOAuthProvider implements IOAuthProvider {
    public abstract getAuthorizationUrl(state: string, redirectUri: string): string;
    public abstract exchangeCodeForToken(code: string, redirectUri: string): Promise<any>;
    public abstract getUserProfile(accessToken: string): Promise<any>;
}

export abstract class AbstractOidcProvider extends AbstractOAuthProvider implements IOidcProvider {
    public abstract validateIdToken(idToken: string): Promise<any>;
}

export abstract class AbstractIdentityProviderAdapter implements IIdentityProviderAdapter {
    public abstract authenticate(credentials: any): Promise<any>;
}
