import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { GoodsReceiptId } from '../../shared/valueobjects/GoodsReceiptId';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { GoodsReceiptNumber } from '../../shared/valueobjects/GoodsReceiptNumber';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { Quantity } from '../../shared/valueobjects/Quantity';
import { UserId } from '../../iam/value-objects/UserId';
import { GoodsReceivedEvent } from '../events/PurchasingEvents';

export class GoodsReceiptItem {
    constructor(
        public readonly productId: ProductId,
        public readonly receivedQuantity: Quantity
    ) {}
}

export class GoodsReceipt extends AggregateRoot<GoodsReceiptId> {
    private readonly _organizationId: OrganizationId;
    private readonly _branchId: BranchId;
    private readonly _purchaseOrderId: PurchaseOrderId;
    private readonly _receiptNumber: GoodsReceiptNumber;
    private readonly _receivedBy: UserId;
    private readonly _items: GoodsReceiptItem[];
    private readonly _receivedAt: Date;

    private constructor(
        id: GoodsReceiptId,
        organizationId: OrganizationId,
        branchId: BranchId,
        purchaseOrderId: PurchaseOrderId,
        receiptNumber: GoodsReceiptNumber,
        receivedBy: UserId,
        items: GoodsReceiptItem[],
        receivedAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._branchId = branchId;
        this._purchaseOrderId = purchaseOrderId;
        this._receiptNumber = receiptNumber;
        this._receivedBy = receivedBy;
        this._items = items;
        this._receivedAt = receivedAt;
    }

    public static create(
        id: GoodsReceiptId,
        organizationId: OrganizationId,
        branchId: BranchId,
        purchaseOrderId: PurchaseOrderId,
        receiptNumber: GoodsReceiptNumber,
        receivedBy: UserId,
        items: GoodsReceiptItem[]
    ): GoodsReceipt {
        const receipt = new GoodsReceipt(id, organizationId, branchId, purchaseOrderId, receiptNumber, receivedBy, items, new Date());
        receipt.addDomainEvent(new GoodsReceivedEvent(id, purchaseOrderId, organizationId, branchId));
        return receipt;
    }

    public static load(
        id: GoodsReceiptId,
        organizationId: OrganizationId,
        branchId: BranchId,
        purchaseOrderId: PurchaseOrderId,
        receiptNumber: GoodsReceiptNumber,
        receivedBy: UserId,
        items: GoodsReceiptItem[],
        receivedAt: Date
    ): GoodsReceipt {
        return new GoodsReceipt(id, organizationId, branchId, purchaseOrderId, receiptNumber, receivedBy, items, receivedAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get branchId(): BranchId { return this._branchId; }
    public get purchaseOrderId(): PurchaseOrderId { return this._purchaseOrderId; }
    public get receiptNumber(): GoodsReceiptNumber { return this._receiptNumber; }
    public get receivedBy(): UserId { return this._receivedBy; }
    public get items(): ReadonlyArray<GoodsReceiptItem> { return this._items; }
    public get receivedAt(): Date { return this._receivedAt; }
}
