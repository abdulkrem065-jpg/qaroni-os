import { Request, Response, NextFunction } from 'express';
import { AuthorizationService } from '../../application/authorization/AuthorizationService';
import { IEventBus } from '../../application/ports/IEventBus';

export class AuthorizationMiddleware {
    constructor(
        private authorizationService: AuthorizationService,
        private eventBus: IEventBus
    ) {}

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Base API boundary guard. Actual granular checks happen in PermissionGuard.
        next();
    };
}
