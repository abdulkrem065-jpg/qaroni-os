import { Response } from 'express';

export class ResponseFormatter {
    public static success<T>(res: Response, data: T, statusCode: number = 200): void {
        res.status(statusCode).json({
            success: true,
            data
        });
    }

    public static error(res: Response, message: string, statusCode: number = 400, details?: any): void {
        res.status(statusCode).json({
            success: false,
            error: {
                message,
                details
            }
        });
    }
}
