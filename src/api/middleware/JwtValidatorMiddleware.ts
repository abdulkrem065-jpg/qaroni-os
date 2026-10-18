import { Request, Response, NextFunction } from 'express';

export const jwtValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }
    next();
};
