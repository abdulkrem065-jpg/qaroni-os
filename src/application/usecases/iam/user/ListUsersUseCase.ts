import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { User } from '../../../../domain/iam/aggregates/User';

export class ListUsersUseCase {
    constructor(private userRepository: IUserRepository) {}

    public async execute(organizationId: string): Promise<User[]> {
        return this.userRepository.findAll(organizationId);
    }
}
