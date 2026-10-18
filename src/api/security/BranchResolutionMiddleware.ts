import { Request, Response, NextFunction } from 'express';
import { AuthFailureHandler } from './AuthFailureHandler';

export class BranchResolutionMiddleware {
    public static handle(req: Request, res: Response, next: NextFunction): void {
        const context = req.securityContext;
        
        // Ensure that if a branch is present and somehow resolved as explicitly disabled, we reject.
        // The domain authentication handles disabling, this acts as an API-level circuit breaker if needed.
        if (context && context.branchId === 'DISABLED') {
            AuthFailureHandler.handle(res, 425, 'Branch Disabled');
            return;
        }
        
        next();
    }
}
