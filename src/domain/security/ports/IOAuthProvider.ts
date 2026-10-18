export interface IOAuthProvider {
    getAuthorizationUrl(state: string, redirectUri: string): string;
    exchangeCodeForToken(code: string, redirectUri: string): Promise<any>;
    getUserProfile(accessToken: string): Promise<any>;
}

export interface IOidcProvider extends IOAuthProvider {
    validateIdToken(idToken: string): Promise<any>;
}

export interface IIdentityProviderAdapter {
    authenticate(credentials: any): Promise<any>;
}
