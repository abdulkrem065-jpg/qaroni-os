import { RouteRegistry } from '../../routing/RouteRegistry';
import { IApiModule } from '../ApiModuleRegistration';
import { ApiDependencyInjectionIntegration } from '../../di/ApiDependencyInjectionIntegration';
import { SecurityPipeline } from '../../security/SecurityPipeline';
import { AccountController } from './controllers/AccountController';
import { AccountingRoutes } from './routes/AccountingRoutes';
import { AccountUseCases } from '../../../application/accounting/usecases/AccountUseCases';
import { JournalUseCases } from '../../../application/accounting/usecases/JournalUseCases';
import { JournalController } from './controllers/JournalController';
import { PostingUseCases } from '../../../application/accounting/usecases/PostingUseCases';
import { PostingController } from './controllers/PostingController';
import { TrialBalanceUseCases } from '../../../application/accounting/usecases/TrialBalanceUseCases';
import { TrialBalanceController } from './controllers/TrialBalanceController';
import { BalanceSheetUseCases } from '../../../application/accounting/usecases/BalanceSheetUseCases';
import { BalanceSheetController } from './controllers/BalanceSheetController';
import { FinancialValidationUseCases } from '../../../application/accounting/usecases/FinancialValidationUseCases';
import { FinancialValidationController } from './controllers/FinancialValidationController';
import { IncomeStatementUseCases } from '../../../application/accounting/usecases/IncomeStatementUseCases';
import { IncomeStatementController } from './controllers/IncomeStatementController';
import { CashFlowUseCases } from '../../../application/accounting/usecases/CashFlowUseCases';
import { CashFlowController } from './controllers/CashFlowController';
import { FinancialRatiosUseCases } from '../../../application/accounting/usecases/FinancialRatiosUseCases';
import { FinancialRatiosController } from './controllers/FinancialRatiosController';

export class AccountingModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        const accountUseCases = resolver.resolve('accountUseCases') as AccountUseCases;
        const journalUseCases = resolver.resolve('journalUseCases') as JournalUseCases;
        const postingUseCases = resolver.resolve('postingUseCases') as PostingUseCases;
        const trialBalanceUseCases = resolver.resolve('trialBalanceUseCases') as TrialBalanceUseCases;
        const balanceSheetUseCases = resolver.resolve('balanceSheetUseCases') as BalanceSheetUseCases;
        const financialValidationUseCases = resolver.resolve('financialValidationUseCases') as FinancialValidationUseCases;
        const incomeStatementUseCases = resolver.resolve('incomeStatementUseCases') as IncomeStatementUseCases;
        const cashFlowUseCases = resolver.resolve('cashFlowUseCases') as CashFlowUseCases;
        const financialRatiosUseCases = resolver.resolve('financialRatiosUseCases') as FinancialRatiosUseCases;
        
        const controller = new AccountController(accountUseCases);
        const journalController = new JournalController(journalUseCases);
        const postingController = new PostingController(postingUseCases);
        const trialBalanceController = new TrialBalanceController(trialBalanceUseCases);
        const balanceSheetController = new BalanceSheetController(balanceSheetUseCases);
        const financialValidationController = new FinancialValidationController(financialValidationUseCases);
        const incomeStatementController = new IncomeStatementController(incomeStatementUseCases);
        const cashFlowController = new CashFlowController(cashFlowUseCases);
        const financialRatiosController = new FinancialRatiosController(financialRatiosUseCases);

        AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, financialValidationController, incomeStatementController, cashFlowController, financialRatiosController, securityPipeline);
    }
}
