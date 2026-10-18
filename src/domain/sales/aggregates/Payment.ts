import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { PaymentId } from '../../shared/valueobjects/PaymentId';
import { InvoiceId } from '../../shared/valueobjects/InvoiceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { MoneyAmount } from '../../shared/valueobjects/MoneyAmount';
import { PaymentMethod, PaymentStatus } from '../types/SalesTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { PaymentReceivedEvent, PaymentRefundedEvent } from '../events/SalesEvents';

export class Payment extends AggregateRoot<PaymentId> {
    private readonly _organizationId: OrganizationId;
    private readonly _invoiceId: InvoiceId;
    private readonly _amount: MoneyAmount;
    private readonly _method: PaymentMethod;
    private _status: PaymentStatus;
    private readonly _createdAt: Date;

    private constructor(
        id: PaymentId,
        organizationId: OrganizationId,
        invoiceId: InvoiceId,
        amount: MoneyAmount,
        method: PaymentMethod,
        status: PaymentStatus,
        createdAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._invoiceId = invoiceId;
        this._amount = amount;
        this._method = method;
        this._status = status;
        this._createdAt = createdAt;
    }

    public static create(
        id: PaymentId,
        organizationId: OrganizationId,
        invoiceId: InvoiceId,
        amount: MoneyAmount,
        method: PaymentMethod
    ): Payment {
        const payment = new Payment(id, organizationId, invoiceId, amount, method, PaymentStatus.COMPLETED, new Date());
        payment.addDomainEvent(new PaymentReceivedEvent(id, invoiceId, organizationId));
        return payment;
    }

    public static load(
        id: PaymentId,
        organizationId: OrganizationId,
        invoiceId: InvoiceId,
        amount: MoneyAmount,
        method: PaymentMethod,
        status: PaymentStatus,
        createdAt: Date
    ): Payment {
        return new Payment(id, organizationId, invoiceId, amount, method, status, createdAt);
    }

    public refund(): void {
        if (this._status !== PaymentStatus.COMPLETED) {
            throw new ValidationError('Can only refund completed payments');
        }
        this._status = PaymentStatus.REFUNDED;
        this.addDomainEvent(new PaymentRefundedEvent(this.id, this._invoiceId, this._organizationId));
    }

    public voidPayment(): void {
        if (this._status !== PaymentStatus.COMPLETED) {
            throw new ValidationError('Can only void completed payments');
        }
        this._status = PaymentStatus.VOIDED;
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get invoiceId(): InvoiceId { return this._invoiceId; }
    public get amount(): MoneyAmount { return this._amount; }
    public get method(): PaymentMethod { return this._method; }
    public get status(): PaymentStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
}
