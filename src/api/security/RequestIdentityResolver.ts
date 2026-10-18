import { Request } from 'express';

export interface RequestIdentityResolver {
    resolve(req: Request): string | null;
}

export class BearerTokenResolver implements RequestIdentityResolver {
    public resolve(req: Request): string | null {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1];
    }
}
