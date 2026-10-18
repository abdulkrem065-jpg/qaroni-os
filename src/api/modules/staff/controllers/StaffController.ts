import { Request, Response } from 'express';
import { StaffUseCases } from '../../../../application/usecases/staff/StaffUseCases';
import { CreateStaffDto, UpdateStaffDto, TransferStaffDto, AssignRoleDto } from '../dtos/StaffDto';

export class StaffController {
    constructor(private readonly staffUseCases: StaffUseCases) {}

    public createStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizationId = req.params.organizationId;
            const dto = req.body as CreateStaffDto;
            const hireDate = new Date(dto.employment.hireDate);
            
            const staffId = await this.staffUseCases.createStaff(
                organizationId,
                dto.branchId,
                dto.profile,
                { ...dto.employment, hireDate }
            );
            res.status(201).json({ id: staffId });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public updateStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            const dto = req.body as UpdateStaffDto;
            
            const employmentData = dto.employment ? {
                ...dto.employment,
                hireDate: new Date(dto.employment.hireDate),
                terminationDate: dto.employment.terminationDate ? new Date(dto.employment.terminationDate) : undefined
            } : undefined;

            await this.staffUseCases.updateStaff(organizationId, staffId, dto.profile, employmentData);
            res.status(200).json({ message: 'Staff updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public activateStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            await this.staffUseCases.activateStaff(organizationId, staffId);
            res.status(200).json({ message: 'Staff activated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public suspendStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            await this.staffUseCases.suspendStaff(organizationId, staffId);
            res.status(200).json({ message: 'Staff suspended successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public archiveStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            await this.staffUseCases.archiveStaff(organizationId, staffId);
            res.status(200).json({ message: 'Staff archived successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public transferBranch = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            const dto = req.body as TransferStaffDto;
            await this.staffUseCases.transferBranch(organizationId, staffId, dto.newBranchId);
            res.status(200).json({ message: 'Staff transferred successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public assignRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            const dto = req.body as AssignRoleDto;
            await this.staffUseCases.assignRole(organizationId, staffId, dto.roleId);
            res.status(200).json({ message: 'Role assigned successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public removeRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId, roleId } = req.params;
            await this.staffUseCases.removeRole(organizationId, staffId, roleId);
            res.status(200).json({ message: 'Role removed successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, staffId } = req.params;
            const staff = await this.staffUseCases.getStaff(organizationId, staffId);
            res.status(200).json({
                id: staff.id.value,
                organizationId: staff.organizationId.value,
                branchId: staff.branchId.value,
                profile: staff.profile,
                employment: {
                    employeeNumber: staff.employment.employeeNumber.value,
                    jobTitle: staff.employment.jobTitle.value,
                    hireDate: staff.employment.hireDate.value.toISOString(),
                    terminationDate: staff.employment.terminationDate?.value.toISOString()
                },
                status: staff.status,
                roles: staff.roles
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public listStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const staffList = await this.staffUseCases.listStaff(organizationId);
            res.status(200).json(staffList.map(staff => ({
                id: staff.id.value,
                organizationId: staff.organizationId.value,
                branchId: staff.branchId.value,
                profile: staff.profile,
                employment: {
                    employeeNumber: staff.employment.employeeNumber.value,
                    jobTitle: staff.employment.jobTitle.value,
                    hireDate: staff.employment.hireDate.value.toISOString(),
                    terminationDate: staff.employment.terminationDate?.value.toISOString()
                },
                status: staff.status,
                roles: staff.roles
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
