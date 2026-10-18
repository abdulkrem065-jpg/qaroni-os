import { ISessionRepository } from '../../../../domain/iam/repositories/ISessionRepository';
import { ApplicationError } from '../../../errors/ApplicationError';

export class TerminateSessionUseCase {
    constructor(private sessionRepository: ISessionRepository) {}

    public async execute(id: string): Promise<void> {
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new ApplicationError(`Session with id ${id} not found`);
        }

        session.revoke();
        await this.sessionRepository.save(session);
    }
}
