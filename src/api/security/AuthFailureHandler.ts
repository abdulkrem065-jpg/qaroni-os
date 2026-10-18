import { Response } from 'express';

export class AuthFailureHandler {
    public static handle(res: Response, statusCode: number, message: string): void {
        res.status(statusCode).json({
            error: {
                code: statusCode,
                message: message
            }
        });
    }
}
