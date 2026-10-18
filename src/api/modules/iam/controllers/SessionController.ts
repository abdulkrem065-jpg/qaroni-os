import { Request, Response } from 'express';
import { ListSessionsUseCase } from '../../../../application/usecases/iam/session/ListSessionsUseCase';
import { TerminateSessionUseCase } from '../../../../application/usecases/iam/session/TerminateSessionUseCase';
import { ResponseFormatter } from '../../../common/ResponseFormatter';
import { SessionMapper } from '../dtos/SessionDTOs';

export class SessionController {
    constructor(
        private listSessionsUseCase: ListSessionsUseCase,
        private terminateSessionUseCase: TerminateSessionUseCase
    ) {}

    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.securityContext?.userId;
            if (!userId) return ResponseFormatter.error(res, 'User Context Missing', 400);

            const sessions = await this.listSessionsUseCase.execute(userId);
            ResponseFormatter.success(res, sessions.map(s => SessionMapper.toDTO(s)));
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            await this.terminateSessionUseCase.execute(id);
            ResponseFormatter.success(res, { message: 'Session terminated' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };
}
