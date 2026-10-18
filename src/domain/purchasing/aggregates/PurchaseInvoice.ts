import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { PurchaseInvoiceId } from '../../shared/valueobjects/PurchaseInvoiceId';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { PurchaseInvoiceNumber } from '../../shared/valueobjects/PurchaseInvoiceNumber';
import { PurchaseTotal } from '../../shared/valueobjects/PurchaseTotal';
import { PurchaseInvoiceStatus } from '../types/PurchasingTypes';

export class PurchaseInvoice extends AggregateRoot<PurchaseInvoiceId> {
    private readonly _organizationId: OrganizationId;
    private readonly _purchaseOrderId: PurchaseOrderId;
    private readonly _invoiceNumber: PurchaseInvoiceNumber;
    private readonly _totalAmount: PurchaseTotal;
    private _paidAmount: PurchaseTotal;
    private _status: PurchaseInvoiceStatus;
    private readonly _createdAt: Date;

    private constructor(
        id: PurchaseInvoiceId,
        organizationId: OrganizationId,
        purchaseOrderId: PurchaseOrderId,
        invoiceNumber: PurchaseInvoiceNumber,
        totalAmount: PurchaseTotal,
        paidAmount: PurchaseTotal,
        status: PurchaseInvoiceStatus,
        createdAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._purchaseOrderId = purchaseOrderId;
        this._invoiceNumber = invoiceNumber;
        this._totalAmount = totalAmount;
        this._paidAmount = paidAmount;
        this._status = status;
        this._createdAt = createdAt;
    }

    public static create(
        id: PurchaseInvoiceId,
        organizationId: OrganizationId,
        purchaseOrderId: PurchaseOrderId,
        invoiceNumber: PurchaseInvoiceNumber,
        totalAmount: PurchaseTotal
    ): PurchaseInvoice {
        return new PurchaseInvoice(id, organizationId, purchaseOrderId, invoiceNumber, totalAmount, PurchaseTotal.create(0), PurchaseInvoiceStatus.ISSUED, new Date());
    }

    public static load(
        id: PurchaseInvoiceId,
        organizationId: OrganizationId,
        purchaseOrderId: PurchaseOrderId,
        invoiceNumber: PurchaseInvoiceNumber,
        totalAmount: PurchaseTotal,
        paidAmount: PurchaseTotal,
        status: PurchaseInvoiceStatus,
        createdAt: Date
    ): PurchaseInvoice {
        return new PurchaseInvoice(id, organizationId, purchaseOrderId, invoiceNumber, totalAmount, paidAmount, status, createdAt);
    }

    public applyPayment(amount: PurchaseTotal): void {
        const newPaidAmount = this._paidAmount.add(amount);
        this._paidAmount = newPaidAmount;
        if (this._paidAmount.value >= this._totalAmount.value) {
            this._status = PurchaseInvoiceStatus.PAID;
        }
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get purchaseOrderId(): PurchaseOrderId { return this._purchaseOrderId; }
    public get invoiceNumber(): PurchaseInvoiceNumber { return this._invoiceNumber; }
    public get totalAmount(): PurchaseTotal { return this._totalAmount; }
    public get paidAmount(): PurchaseTotal { return this._paidAmount; }
    public get status(): PurchaseInvoiceStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
}
