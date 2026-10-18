import { Request, Response, NextFunction } from 'express';
import { CreateStaffDto, UpdateStaffDto, TransferStaffDto, AssignRoleDto } from '../dtos/StaffDto';

export class StaffValidation {
    public static validateCreateStaff(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as CreateStaffDto;
        const errors: string[] = [];

        if (!body.branchId) errors.push('branchId is required');
        if (!body.profile) {
            errors.push('profile is required');
        } else {
            if (!body.profile.firstName) errors.push('profile.firstName is required');
            if (!body.profile.lastName) errors.push('profile.lastName is required');
            if (!body.profile.email) errors.push('profile.email is required');
        }
        if (!body.employment) {
            errors.push('employment is required');
        } else {
            if (!body.employment.employeeNumber) errors.push('employment.employeeNumber is required');
            if (!body.employment.jobTitle) errors.push('employment.jobTitle is required');
            if (!body.employment.hireDate) errors.push('employment.hireDate is required');
            else if (isNaN(Date.parse(body.employment.hireDate))) errors.push('employment.hireDate must be a valid date string');
        }

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation Error', details: errors });
            return;
        }
        next();
    }

    public static validateUpdateStaff(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as UpdateStaffDto;
        const errors: string[] = [];

        if (body.profile) {
            if (!body.profile.firstName) errors.push('profile.firstName cannot be empty if profile is provided');
            if (!body.profile.lastName) errors.push('profile.lastName cannot be empty if profile is provided');
            if (!body.profile.email) errors.push('profile.email cannot be empty if profile is provided');
        }
        if (body.employment) {
            if (!body.employment.employeeNumber) errors.push('employment.employeeNumber cannot be empty if employment is provided');
            if (!body.employment.jobTitle) errors.push('employment.jobTitle cannot be empty if employment is provided');
            if (!body.employment.hireDate) errors.push('employment.hireDate cannot be empty if employment is provided');
            else if (isNaN(Date.parse(body.employment.hireDate))) errors.push('employment.hireDate must be a valid date string');
            if (body.employment.terminationDate && isNaN(Date.parse(body.employment.terminationDate))) {
                errors.push('employment.terminationDate must be a valid date string');
            }
        }

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation Error', details: errors });
            return;
        }
        next();
    }

    public static validateTransferStaff(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as TransferStaffDto;
        if (!body.newBranchId) {
            res.status(400).json({ error: 'Validation Error', details: ['newBranchId is required'] });
            return;
        }
        next();
    }

    public static validateAssignRole(req: Request, res: Response, next: NextFunction): void {
        const body = req.body as AssignRoleDto;
        if (!body.roleId) {
            res.status(400).json({ error: 'Validation Error', details: ['roleId is required'] });
            return;
        }
        next();
    }
}
