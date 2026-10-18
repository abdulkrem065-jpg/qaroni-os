import { Request, Response, NextFunction } from 'express';

export const sessionValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    next();
};
