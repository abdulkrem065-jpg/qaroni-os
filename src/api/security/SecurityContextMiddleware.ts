import { Request, Response, NextFunction } from 'express';

export interface SecurityContext {
    token?: string;
    userId?: string;
    organizationId?: string;
    branchId?: string;
    sessionId?: string;
}

declare global {
    namespace Express {
        interface Request {
            securityContext?: SecurityContext;
        }
    }
}

export class SecurityContextMiddleware {
    public static handle(req: Request, res: Response, next: NextFunction): void {
        req.securityContext = {};
        next();
    }
}
