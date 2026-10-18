import { IUserRepository } from '../../../../domain/iam/repositories/IUserRepository';
import { User } from '../../../../domain/iam/aggregates/User';

export class GetUserUseCase {
    constructor(private userRepository: IUserRepository) {}

    public async execute(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}
