import { IJwtProvider, IJwtClaimsMapper } from '../../../domain/security/ports/IJwtProvider';
import { ITokenPayload } from '../../../domain/security/models/SecurityModels';
import jwt from 'jsonwebtoken';

export class LocalJwtProvider implements IJwtProvider {
    private revokedTokens: Set<string> = new Set();
    
    private getSecret(): string {
        return process.env.JWT_SECRET || 'qeos_default_development_jwt_secret_999';
    }

    public async generateAccessToken(payload: Partial<ITokenPayload>): Promise<string> {
        const fullPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            iss: 'qeos-auth',
            aud: 'qeos-clients'
        };
        // 1 hour expiration
        return jwt.sign(fullPayload, this.getSecret(), { expiresIn: '1h', jwtid: payload.jti || `jti-${Date.now()}` });
    }

    public async generateRefreshToken(payload: Partial<ITokenPayload>): Promise<string> {
        const fullPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            iss: 'qeos-auth',
            aud: 'qeos-clients'
        };
        // 7 days expiration
        return jwt.sign(fullPayload, this.getSecret(), { expiresIn: '7d', jwtid: payload.jti || `ref-${Date.now()}` });
    }

    public async validateToken(token: string): Promise<ITokenPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.getSecret(), async (err, decoded) => {
                if (err) {
                    return reject(new Error('Invalid or expired token'));
                }
                const payload = decoded as ITokenPayload;
                if (payload.jti && await this.isTokenRevoked(payload.jti)) {
                    return reject(new Error('Token revoked'));
                }
                resolve(payload);
            });
        });
    }

    public decodeToken(token: string): ITokenPayload | null {
        const decoded = jwt.decode(token);
        return decoded as ITokenPayload | null;
    }

    public async revokeToken(jti: string): Promise<void> {
        this.revokedTokens.add(jti);
    }

    public async isTokenRevoked(jti: string): Promise<boolean> {
        return this.revokedTokens.has(jti);
    }
}

export class DefaultJwtClaimsMapper implements IJwtClaimsMapper {
    public mapToPayload(user: any, context: any): Partial<ITokenPayload> {
        return {
            sub: user.id,
            claims: { roles: user.roles, organizationId: context?.organizationId }
        };
    }

    public mapFromPayload(payload: ITokenPayload): any {
        return {
            id: payload.sub,
            roles: payload.claims?.roles
        };
    }
}
