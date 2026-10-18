import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { InvoiceId } from '../../shared/valueobjects/InvoiceId';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { InvoiceNumber } from '../../shared/valueobjects/InvoiceNumber';
import { MoneyAmount } from '../../shared/valueobjects/MoneyAmount';
import { InvoiceStatus } from '../types/SalesTypes';
import { ValidationError } from '../../shared/errors/ValidationError';

export class SalesInvoice extends AggregateRoot<InvoiceId> {
    private readonly _organizationId: OrganizationId;
    private readonly _salesOrderId: SalesOrderId;
    private readonly _invoiceNumber: InvoiceNumber;
    private readonly _totalAmount: MoneyAmount;
    private _paidAmount: MoneyAmount;
    private _status: InvoiceStatus;
    private readonly _createdAt: Date;

    private constructor(
        id: InvoiceId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        invoiceNumber: InvoiceNumber,
        totalAmount: MoneyAmount,
        paidAmount: MoneyAmount,
        status: InvoiceStatus,
        createdAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._salesOrderId = salesOrderId;
        this._invoiceNumber = invoiceNumber;
        this._totalAmount = totalAmount;
        this._paidAmount = paidAmount;
        this._status = status;
        this._createdAt = createdAt;
    }

    public static create(
        id: InvoiceId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        invoiceNumber: InvoiceNumber,
        totalAmount: MoneyAmount
    ): SalesInvoice {
        return new SalesInvoice(id, organizationId, salesOrderId, invoiceNumber, totalAmount, MoneyAmount.create(0), InvoiceStatus.ISSUED, new Date());
    }

    public static load(
        id: InvoiceId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        invoiceNumber: InvoiceNumber,
        totalAmount: MoneyAmount,
        paidAmount: MoneyAmount,
        status: InvoiceStatus,
        createdAt: Date
    ): SalesInvoice {
        return new SalesInvoice(id, organizationId, salesOrderId, invoiceNumber, totalAmount, paidAmount, status, createdAt);
    }

    public applyPayment(amount: MoneyAmount): void {
        if (this._status === InvoiceStatus.CANCELLED) throw new ValidationError('Cannot apply payment to cancelled invoice');
        
        const newPaidAmount = this._paidAmount.add(amount);
        if (newPaidAmount.value > this._totalAmount.value) {
            throw new ValidationError('Payments cannot exceed invoice total');
        }
        
        this._paidAmount = newPaidAmount;
        if (this._paidAmount.value === this._totalAmount.value) {
            this._status = InvoiceStatus.PAID;
        }
    }

    public applyRefund(amount: MoneyAmount): void {
        if (this._status === InvoiceStatus.CANCELLED) throw new ValidationError('Cannot refund cancelled invoice');
        
        this._paidAmount = this._paidAmount.subtract(amount);
        if (this._status === InvoiceStatus.PAID && this._paidAmount.value < this._totalAmount.value) {
            this._status = InvoiceStatus.ISSUED; // Revert to issued
        }
    }

    public cancel(): void {
        if (this._status === InvoiceStatus.PAID) throw new ValidationError('Cannot cancel fully paid invoice');
        this._status = InvoiceStatus.CANCELLED;
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get salesOrderId(): SalesOrderId { return this._salesOrderId; }
    public get invoiceNumber(): InvoiceNumber { return this._invoiceNumber; }
    public get totalAmount(): MoneyAmount { return this._totalAmount; }
    public get paidAmount(): MoneyAmount { return this._paidAmount; }
    public get status(): InvoiceStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
}
