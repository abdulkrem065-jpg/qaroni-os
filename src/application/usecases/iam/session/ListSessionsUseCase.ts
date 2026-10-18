import { ISessionRepository } from '../../../../domain/iam/repositories/ISessionRepository';
import { Session } from '../../../../domain/iam/entities/Session';

export class ListSessionsUseCase {
    constructor(private sessionRepository: ISessionRepository) {}

    public async execute(userId: string): Promise<Session[]> {
        return this.sessionRepository.findByUserId(userId);
    }
}
