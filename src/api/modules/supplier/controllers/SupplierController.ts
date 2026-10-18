import { Request, Response } from 'express';
import { SupplierUseCases } from '../../../../application/usecases/supplier/SupplierUseCases';
import { CreateSupplierDto, UpdateSupplierDto } from '../dtos/SupplierDto';

export class SupplierController {
    constructor(private readonly supplierUseCases: SupplierUseCases) {}

    public createSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const dto = req.body as CreateSupplierDto;
            const id = await this.supplierUseCases.createSupplier(
                organizationId, dto.code, dto.name, dto.phone || '', dto.email || '', dto.address || '', dto.taxNumber || '', dto.commercialRegistration || ''
            );
            res.status(201).json({ id });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public updateSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const dto = req.body as UpdateSupplierDto;
            await this.supplierUseCases.updateSupplier(
                organizationId, id, dto.name, dto.phone || '', dto.email || '', dto.address || '', dto.taxNumber || '', dto.commercialRegistration || ''
            );
            res.status(200).json({ message: 'Supplier updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public listSuppliers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId } = req.params;
            const suppliers = await this.supplierUseCases.listSuppliers(organizationId);
            res.status(200).json(suppliers.map(s => ({
                id: s.id.value,
                code: s.code.value,
                name: s.name.value,
                contact: s.contact,
                legalInfo: s.legalInfo,
                status: s.status,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            })));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            const s = await this.supplierUseCases.getSupplier(organizationId, id);
            res.status(200).json({
                id: s.id.value,
                code: s.code.value,
                name: s.name.value,
                contact: s.contact,
                legalInfo: s.legalInfo,
                status: s.status,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public activateSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            await this.supplierUseCases.activateSupplier(organizationId, id);
            res.status(200).json({ message: 'Supplier activated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public suspendSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            await this.supplierUseCases.suspendSupplier(organizationId, id);
            res.status(200).json({ message: 'Supplier suspended successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public archiveSupplier = async (req: Request, res: Response): Promise<void> => {
        try {
            const { organizationId, id } = req.params;
            await this.supplierUseCases.archiveSupplier(organizationId, id);
            res.status(200).json({ message: 'Supplier archived successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
