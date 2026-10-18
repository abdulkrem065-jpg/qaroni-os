import { Request, Response } from 'express';
import { CustomerUseCases } from '../../../../application/customer/usecases/CustomerUseCases';

export class CustomerController {
    constructor(private readonly useCases: CustomerUseCases) {
        this.createCustomer = this.createCustomer.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
        this.archiveCustomer = this.archiveCustomer.bind(this);
        this.restoreCustomer = this.restoreCustomer.bind(this);
        this.getCustomer = this.getCustomer.bind(this);
        this.listCustomers = this.listCustomers.bind(this);
        this.changeCreditLimit = this.changeCreditLimit.bind(this);
    }

    public async createCustomer(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const dto = { ...req.body, organizationId };
            const result = await this.useCases.createCustomer(dto);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateCustomer(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const customerId = req.params.customerId;
            const dto = { ...req.body, organizationId, customerId };
            const result = await this.useCases.updateCustomer(dto);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async changeCreditLimit(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const customerId = req.params.customerId;
            const dto = { ...req.body, organizationId, customerId };
            const result = await this.useCases.changeCreditLimit(dto);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async archiveCustomer(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const customerId = req.params.customerId;
            await this.useCases.archiveCustomer(organizationId, customerId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async restoreCustomer(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const customerId = req.params.customerId;
            await this.useCases.restoreCustomer(organizationId, customerId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async getCustomer(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const customerId = req.params.customerId;
            const result = await this.useCases.getCustomer(organizationId, customerId);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Customer not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    public async listCustomers(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const result = await this.useCases.listCustomers(organizationId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
