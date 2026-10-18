export class AuthenticationResult {
    constructor(
        public readonly success: boolean,
        public readonly accessToken?: string,
        public readonly refreshToken?: string,
        public readonly error?: string
    ) {}

    public static success(accessToken: string, refreshToken: string): AuthenticationResult {
        return new AuthenticationResult(true, accessToken, refreshToken);
    }

    public static failure(error: string): AuthenticationResult {
        return new AuthenticationResult(false, undefined, undefined, error);
    }
}
