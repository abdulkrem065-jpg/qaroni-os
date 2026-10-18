import { Request, Response, NextFunction } from 'express';
import { BranchStatus, BranchType } from '../../../../domain/organization/types/BranchTypes';

export class BranchValidation {
    public static validateCreate(req: Request, res: Response, next: NextFunction): void {
        const { organizationId } = req.params;
        const { code, name, address } = req.body;
        
        if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
            return next(BranchValidation.createValidationError('Organization ID is required in the path.'));
        }

        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return next(BranchValidation.createValidationError('Branch code is required and must be a string.'));
        }

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return next(BranchValidation.createValidationError('Branch name is required and must be a string.'));
        }
        
        if (!address || typeof address !== 'object') {
            return next(BranchValidation.createValidationError('Branch address is required.'));
        }
        
        const { street, city, state, country, postalCode } = address;
        if (!street || !city || !state || !country || !postalCode) {
            return next(BranchValidation.createValidationError('Complete address (street, city, state, country, postalCode) is required.'));
        }
        
        next();
    }

    public static validateUpdate(req: Request, res: Response, next: NextFunction): void {
        const { profile, settings } = req.body;
        
        if (profile?.address) {
            const { street, city, state, country, postalCode } = profile.address;
            if (!street || !city || !state || !country || !postalCode) {
                return next(BranchValidation.createValidationError('Complete address (street, city, state, country, postalCode) is required for update if address is provided.'));
            }
        }

        if (settings?.type && !Object.values(BranchType).includes(settings.type as BranchType)) {
             return next(BranchValidation.createValidationError('Invalid branch type.'));
        }
        
        next();
    }

    public static validateAction(req: Request, res: Response, next: NextFunction): void {
        // Status transitions are validated in Domain Aggregate
        next();
    }

    private static createValidationError(message: string): Error {
        const error = new Error(message);
        error.name = 'ValidationError';
        return error;
    }
}
