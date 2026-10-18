import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { ReceiptId } from '../../shared/valueobjects/ReceiptId';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { ReceiptNumber } from '../../shared/valueobjects/ReceiptNumber';
import { ReceiptPrintedEvent } from '../events/SalesEvents';

export class Receipt extends AggregateRoot<ReceiptId> {
    private readonly _organizationId: OrganizationId;
    private readonly _salesOrderId: SalesOrderId;
    private readonly _receiptNumber: ReceiptNumber;
    private readonly _printedAt: Date;

    private constructor(
        id: ReceiptId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        receiptNumber: ReceiptNumber,
        printedAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._salesOrderId = salesOrderId;
        this._receiptNumber = receiptNumber;
        this._printedAt = printedAt;
    }

    public static create(
        id: ReceiptId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        receiptNumber: ReceiptNumber
    ): Receipt {
        const receipt = new Receipt(id, organizationId, salesOrderId, receiptNumber, new Date());
        receipt.addDomainEvent(new ReceiptPrintedEvent(id, salesOrderId, organizationId));
        return receipt;
    }

    public static load(
        id: ReceiptId,
        organizationId: OrganizationId,
        salesOrderId: SalesOrderId,
        receiptNumber: ReceiptNumber,
        printedAt: Date
    ): Receipt {
        return new Receipt(id, organizationId, salesOrderId, receiptNumber, printedAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get salesOrderId(): SalesOrderId { return this._salesOrderId; }
    public get receiptNumber(): ReceiptNumber { return this._receiptNumber; }
    public get printedAt(): Date { return this._printedAt; }
}
