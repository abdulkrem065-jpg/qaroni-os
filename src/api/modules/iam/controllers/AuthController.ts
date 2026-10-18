import { Request, Response } from 'express';
import { AuthenticationService } from '../../../../application/authentication/services/AuthenticationService';
import { ResponseFormatter } from '../../../common/ResponseFormatter';
import { LoginRequestDTO, RefreshRequestDTO } from '../dtos/AuthDTOs';

export class AuthController {
    constructor(private authenticationService: AuthenticationService) {}

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: LoginRequestDTO = req.body;
            if (!dto.email || !dto.passwordPlain) {
                return ResponseFormatter.error(res, 'Email and password are required', 400);
            }

            const result = await this.authenticationService.login(dto.email, dto.passwordPlain);
            if (result.success) {
                ResponseFormatter.success(res, {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                });
            } else {
                ResponseFormatter.error(res, result.error || 'Authentication failed', 401);
            }
        } catch (error: any) {
            ResponseFormatter.error(res, error.message || 'Internal Server Error', 500);
        }
    };

    public logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessionId = req.securityContext?.sessionId;
            if (!sessionId) {
                return ResponseFormatter.error(res, 'No active session', 400);
            }

            await this.authenticationService.logout(sessionId);
            ResponseFormatter.success(res, { message: 'Logged out successfully' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message || 'Internal Server Error', 500);
        }
    };

    public refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: RefreshRequestDTO = req.body;
            if (!dto.sessionId) {
                return ResponseFormatter.error(res, 'sessionId is required', 400);
            }

            const result = await this.authenticationService.refreshSession(dto.sessionId);
            if (result.success) {
                ResponseFormatter.success(res, {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                });
            } else {
                ResponseFormatter.error(res, result.error || 'Refresh failed', 401);
            }
        } catch (error: any) {
            ResponseFormatter.error(res, error.message || 'Internal Server Error', 500);
        }
    };

    public getMe = async (req: Request, res: Response): Promise<void> => {
        try {
            const context = req.securityContext;
            if (!context) {
                return ResponseFormatter.error(res, 'Unauthorized', 401);
            }

            ResponseFormatter.success(res, {
                userId: context.userId,
                organizationId: context.organizationId,
                branchId: context.branchId,
                sessionId: context.sessionId
            });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message || 'Internal Server Error', 500);
        }
    };
}
