import { WorkflowDefinition } from '../aggregates/WorkflowDefinition';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ApprovalRule } from '../valueobjects/ApprovalRule';

export class BusinessProcessDefinitions {
    public static createSalesWorkflow(): WorkflowDefinition {
        return WorkflowBuilder.create('SalesOrderWorkflow')
            .description('Standard sales order processing workflow')
            .module('Sales')
            .initialState('DRAFT')
            .addTransition('DRAFT', 'PENDING_APPROVAL', 'submit', new ApprovalRule({ type: 'SINGLE', requiredApprovals: 1, roles: ['SalesManager'] }))
            .addTransition('PENDING_APPROVAL', 'APPROVED', 'approve')
            .addTransition('PENDING_APPROVAL', 'REJECTED', 'reject')
            .addTransition('APPROVED', 'PROCESSING', 'start_processing')
            .addTransition('PROCESSING', 'SHIPPED', 'ship')
            .addTransition('SHIPPED', 'DELIVERED', 'deliver')
            .addTransition('DELIVERED', 'INVOICED', 'invoice')
            .addTransition('INVOICED', 'CLOSED', 'close')
            .build();
    }

    public static createPurchasingWorkflow(): WorkflowDefinition {
        return WorkflowBuilder.create('PurchaseOrderWorkflow')
            .description('Standard purchase order processing workflow')
            .module('Purchasing')
            .initialState('DRAFT')
            .addTransition('DRAFT', 'PENDING_APPROVAL', 'submit', new ApprovalRule({ type: 'MULTI_LEVEL', requiredApprovals: 2, roles: ['PurchasingManager', 'FinanceController'] }))
            .addTransition('PENDING_APPROVAL', 'APPROVED', 'approve')
            .addTransition('PENDING_APPROVAL', 'REJECTED', 'reject')
            .addTransition('APPROVED', 'ISSUED', 'issue_to_supplier')
            .addTransition('ISSUED', 'RECEIVING', 'start_receiving')
            .addTransition('RECEIVING', 'RECEIVED', 'complete_receipt')
            .addTransition('RECEIVED', 'CLOSED', 'close')
            .build();
    }

    public static createInventoryWorkflow(): WorkflowDefinition {
        return WorkflowBuilder.create('StockTransferWorkflow')
            .description('Stock transfer between warehouses')
            .module('Inventory')
            .initialState('DRAFT')
            .addTransition('DRAFT', 'PENDING_APPROVAL', 'submit', new ApprovalRule({ type: 'SINGLE', requiredApprovals: 1, roles: ['WarehouseManager'] }))
            .addTransition('PENDING_APPROVAL', 'APPROVED', 'approve')
            .addTransition('APPROVED', 'IN_TRANSIT', 'ship')
            .addTransition('IN_TRANSIT', 'COMPLETED', 'receive')
            .build();
    }

    public static createAccountingWorkflow(): WorkflowDefinition {
        return WorkflowBuilder.create('JournalApprovalWorkflow')
            .description('Journal entry approval workflow')
            .module('Accounting')
            .initialState('DRAFT')
            .addTransition('DRAFT', 'PENDING_APPROVAL', 'submit', new ApprovalRule({ type: 'SEQUENTIAL', requiredApprovals: 2, roles: ['SeniorAccountant', 'ChiefFinancialOfficer'] }))
            .addTransition('PENDING_APPROVAL', 'APPROVED', 'approve')
            .addTransition('PENDING_APPROVAL', 'REJECTED', 'reject')
            .addTransition('APPROVED', 'POSTED', 'post')
            .build();
    }
}
