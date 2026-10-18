import { IPermissionRepository } from '../../../../domain/iam/repositories/IPermissionRepository';
import { ApplicationError } from '../../../errors/ApplicationError';

export class DeletePermissionUseCase {
    constructor(private permissionRepository: IPermissionRepository) {}

    public async execute(id: string): Promise<void> {
        const permission = await this.permissionRepository.findById(id);
        if (!permission) {
            throw new ApplicationError(`Permission with id ${id} not found`);
        }
        await this.permissionRepository.delete(id);
    }
}
