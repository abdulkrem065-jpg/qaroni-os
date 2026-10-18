import { ITokenPayload } from '../models/SecurityModels';

export interface IJwtProvider {
    generateAccessToken(payload: Partial<ITokenPayload>): Promise<string>;
    generateRefreshToken(payload: Partial<ITokenPayload>): Promise<string>;
    validateToken(token: string): Promise<ITokenPayload>;
    decodeToken(token: string): ITokenPayload | null;
    revokeToken(jti: string): Promise<void>;
    isTokenRevoked(jti: string): Promise<boolean>;
}

export interface IJwtClaimsMapper {
    mapToPayload(user: any, context: any): Partial<ITokenPayload>;
    mapFromPayload(payload: ITokenPayload): any;
}
