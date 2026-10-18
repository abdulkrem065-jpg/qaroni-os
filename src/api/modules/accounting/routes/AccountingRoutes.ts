import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { AccountController } from '../controllers/AccountController';
import { AccountValidation } from '../validation/AccountValidation';
import { JournalController } from '../controllers/JournalController';
import { JournalValidation } from '../validation/JournalValidation';
import { PostingController } from '../controllers/PostingController';
import { PostingValidation } from '../validation/PostingValidation';
import { TrialBalanceController } from '../controllers/TrialBalanceController';
import { TrialBalanceValidation } from '../validation/TrialBalanceValidation';
import { BalanceSheetController } from '../controllers/BalanceSheetController';
import { BalanceSheetValidation } from '../validation/BalanceSheetValidation';
import { FinancialValidationController } from '../controllers/FinancialValidationController';
import { FinancialValidationRequestValidation } from '../validation/FinancialValidationRequestValidation';
import { IncomeStatementController } from '../controllers/IncomeStatementController';
import { IncomeStatementValidation } from '../validation/IncomeStatementValidation';
import { CashFlowController } from '../controllers/CashFlowController';
import { CashFlowValidation } from '../validation/CashFlowValidation';
import { FinancialRatiosController } from '../controllers/FinancialRatiosController';
import { FinancialRatiosValidation } from '../validation/FinancialRatiosValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class AccountingRoutes {
    public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, financialValidationController: FinancialValidationController, incomeStatementController: IncomeStatementController, cashFlowController: CashFlowController, financialRatiosController: FinancialRatiosController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/accounting/accounts';

        registry.register({
            path: basePath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'account'),
            handler: controller.listAccounts
        });

        registry.register({
            path: `${basePath}/:accountId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'account'),
            handler: controller.getAccount
        });

        registry.register({
            path: basePath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'account'),
                AccountValidation.validateCreateAccount
            ],
            handler: controller.createAccount
        });

        registry.register({
            path: `${basePath}/:accountId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'account'),
                AccountValidation.validateUpdateAccount
            ],
            handler: controller.updateAccount
        });

        registry.register({
            path: `${basePath}/:accountId/archive`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('delete', 'account'), // soft delete uses delete permission usually
            handler: controller.archiveAccount
        });

        registry.register({
            path: `${basePath}/:accountId/restore`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'account'),
            handler: controller.restoreAccount
        });

        registry.register({
            path: `${basePath}/:accountId/move`,
            method: HttpMethod.PATCH,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'account'),
                AccountValidation.validateMoveAccount
            ],
            handler: controller.moveAccount
        });

        // Journals
        const journalPath = '/api/v1/organizations/:organizationId/accounting/journals';
        
        registry.register({
            path: journalPath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'journal'),
            handler: journalController.listJournals
        });

        registry.register({
            path: `${journalPath}/:journalId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'journal'),
            handler: journalController.getJournal
        });

        registry.register({
            path: journalPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'journal'),
                JournalValidation.validateCreateJournal
            ],
            handler: journalController.createJournal
        });

        registry.register({
            path: `${journalPath}/:journalId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'journal'),
                JournalValidation.validateUpdateJournal
            ],
            handler: journalController.updateJournal
        });

        registry.register({
            path: `${journalPath}/:journalId/lines`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'journal'),
                JournalValidation.validateJournalLine
            ],
            handler: journalController.addJournalLine
        });

        registry.register({
            path: `${journalPath}/:journalId/lines/:lineId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('update', 'journal'),
            handler: journalController.removeJournalLine
        });

        registry.register({
            path: `${journalPath}/:journalId/approve`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'journal'), // Needs distinct permission later
            handler: journalController.approveJournal
        });

        registry.register({
            path: `${journalPath}/:journalId/reject`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'journal'),
            handler: journalController.rejectJournal
        });

        registry.register({
            path: `${journalPath}/:journalId/cancel`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('delete', 'journal'),
            handler: journalController.cancelJournal
        });

        registry.register({
            path: `${journalPath}/:journalId/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'journal'),
            handler: journalController.validateJournalBalance
        });

        // Postings
        const postingPath = '/api/v1/organizations/:organizationId/accounting/postings';
        
        registry.register({
            path: postingPath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'posting'),
            handler: postingController.getPostingHistory
        });

        registry.register({
            path: postingPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'posting'),
                PostingValidation.validateExecutePosting
            ],
            handler: postingController.executePosting
        });

        registry.register({
            path: `${postingPath}/validate`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'posting'),
            handler: postingController.validatePosting
        });

        registry.register({
            path: `${postingPath}/:batchId/retry`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('update', 'posting'),
            handler: postingController.retryFailedPosting
        });

        registry.register({
            path: `${postingPath}/:batchId/lock`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'posting'),
            handler: postingController.lockPosting
        });

        // Trial Balance
        const tbPath = '/api/v1/organizations/:organizationId/accounting/trial-balance';
        
        registry.register({
            path: tbPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'trial_balance'),
                TrialBalanceValidation.validateGenerate
            ],
            handler: trialBalanceController.generateTrialBalance
        });

        registry.register({
            path: `${tbPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.compareTrialBalances
        });

        registry.register({
            path: `${tbPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.getTrialBalance
        });

        registry.register({
            path: `${tbPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.validateTrialBalance
        });

        registry.register({
            path: `${tbPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.exportTrialBalance
        });

        // Balance Sheet
        const bsPath = '/api/v1/organizations/:organizationId/accounting/balance-sheet';
        
        registry.register({
            path: bsPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'balance_sheet'),
                BalanceSheetValidation.validateGenerate
            ],
            handler: balanceSheetController.generateBalanceSheet
        });

        registry.register({
            path: `${bsPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.compareBalanceSheets
        });

        registry.register({
            path: `${bsPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.getBalanceSheet
        });

        registry.register({
            path: `${bsPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.validateBalanceSheet
        });

        registry.register({
            path: `${bsPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.exportBalanceSheet
        });

        // Financial Validation
        const valPath = '/api/v1/organizations/:organizationId/accounting/validation';
        
        registry.register({
            path: valPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'financial_validation'),
                FinancialValidationRequestValidation.validateExecute
            ],
            handler: financialValidationController.executeValidation
        });

        registry.register({
            path: valPath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_validation'),
            handler: financialValidationController.getValidationHistory
        });

        // Income Statement
        const isPath = '/api/v1/organizations/:organizationId/accounting/income-statement';
        
        registry.register({
            path: isPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'income_statement'),
                IncomeStatementValidation.validateGenerate
            ],
            handler: incomeStatementController.generateIncomeStatement
        });

        registry.register({
            path: `${isPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.compareIncomeStatements
        });

        registry.register({
            path: `${isPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.getIncomeStatement
        });

        registry.register({
            path: `${isPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.validateIncomeStatement
        });

        registry.register({
            path: `${isPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.exportIncomeStatement
        });

        // Cash Flow Statement
        const cfPath = '/api/v1/organizations/:organizationId/accounting/cash-flow';
        
        registry.register({
            path: cfPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'cash_flow'),
                CashFlowValidation.validateGenerate
            ],
            handler: cashFlowController.generateCashFlow
        });

        registry.register({
            path: `${cfPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.compareCashFlows
        });

        registry.register({
            path: `${cfPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.getCashFlow
        });

        registry.register({
            path: `${cfPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.validateCashFlow
        });

        registry.register({
            path: `${cfPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.exportCashFlow
        });

        // Financial Ratios
        const frPath = '/api/v1/organizations/:organizationId/accounting/financial-ratios';
        
        registry.register({
            path: frPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'financial_ratios'),
                FinancialRatiosValidation.validateGenerate
            ],
            handler: financialRatiosController.generateRatios
        });

        registry.register({
            path: `${frPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.compareRatios
        });

        registry.register({
            path: `${frPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.getRatios
        });

        registry.register({
            path: `${frPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.validateRatios
        });
    }
}








