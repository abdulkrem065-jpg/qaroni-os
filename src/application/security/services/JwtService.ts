import { IJwtProvider, IJwtClaimsMapper } from '../../../domain/security/ports/IJwtProvider';
import { ITokenPayload } from '../../../domain/security/models/SecurityModels';

export class JwtService {
    constructor(
        private readonly jwtProvider: IJwtProvider,
        private readonly claimsMapper: IJwtClaimsMapper
    ) {}

    public async createTokens(user: any, context: any) {
        const payload = this.claimsMapper.mapToPayload(user, context);
        const accessToken = await this.jwtProvider.generateAccessToken(payload);
        const refreshToken = await this.jwtProvider.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    }

    public async validateToken(token: string): Promise<ITokenPayload> {
        return this.jwtProvider.validateToken(token);
    }
    
    public async rotateToken(oldToken: string): Promise<string> {
        const decoded = await this.jwtProvider.validateToken(oldToken);
        await this.jwtProvider.revokeToken(decoded.jti);
        return this.jwtProvider.generateAccessToken(decoded);
    }
}
