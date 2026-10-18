import { IRoleRepository } from '../../../../domain/iam/repositories/IRoleRepository';
import { ApplicationError } from '../../../errors/ApplicationError';

export class DeleteRoleUseCase {
    constructor(private roleRepository: IRoleRepository) {}

    public async execute(id: string): Promise<void> {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new ApplicationError(`Role with id ${id} not found`);
        }
        await this.roleRepository.delete(id);
    }
}
