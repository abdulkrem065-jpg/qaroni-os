import React from 'react';
import { useRole, DashboardRole } from '../engine/RoleContext';
import { PageContainer } from '../../shell/components/PageContainer';
import { SectionTitle } from '../../shell/components/SectionTitle';
import { LocalizedText, useTranslation } from '../../../localization';
import { WidgetRegistry } from '../engine/WidgetRegistry';
import { RoleSelector } from './RoleSelector';

import '../widgets'; // Ensure widgets are registered

const StoreOwnerLayout = () => {
  const TodaysSales = WidgetRegistry.getWidget('todays_sales')!;
  const TodaysProfit = WidgetRegistry.getWidget('todays_profit')!;
  const CashPosition = WidgetRegistry.getWidget('cash_position')!;
  const ExecutiveSummary = WidgetRegistry.getWidget('executive_summary')!;
  const TopSelling = WidgetRegistry.getWidget('top_selling_products')!;
  const Alerts = WidgetRegistry.getWidget('inventory_alerts')!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <CashPosition id="cash_position" />
        <TodaysProfit id="todays_profit" />
        <TodaysSales id="todays_sales" />
        <Alerts id="inventory_alerts" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <ExecutiveSummary id="executive_summary" className="h-full min-h-[300px]" />
        </div>
        <div>
          <TopSelling id="top_selling_products" className="h-full min-h-[300px]" />
        </div>
      </div>
    </div>
  );
};

const CashierLayout = () => {
  const TodaysSales = WidgetRegistry.getWidget('todays_sales')!;
  const RecentTransactions = WidgetRegistry.getWidget('recent_transactions')!;
  const QuickActions = WidgetRegistry.getWidget('quick_actions')!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <TodaysSales id="todays_sales" className="md:col-span-1" />
        <QuickActions id="quick_actions" className="md:col-span-2" />
      </div>
      <RecentTransactions id="recent_transactions" className="min-h-[400px]" />
    </div>
  );
};

const WarehouseLayout = () => {
  const Alerts = WidgetRegistry.getWidget('inventory_alerts')!;
  const SlowMoving = WidgetRegistry.getWidget('slow_moving_products')!;
  const TodaysPurchases = WidgetRegistry.getWidget('todays_purchases')!;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Alerts id="inventory_alerts" />
      <TodaysPurchases id="todays_purchases" />
      <SlowMoving id="slow_moving_products" />
    </div>
  );
};

const AccountantLayout = () => {
  const Receivables = WidgetRegistry.getWidget('accounts_receivable')!;
  const Payables = WidgetRegistry.getWidget('accounts_payable')!;
  const CashPosition = WidgetRegistry.getWidget('cash_position')!;
  const FinancialHealth = WidgetRegistry.getWidget('financial_health')!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <CashPosition id="cash_position" />
        <Receivables id="accounts_receivable" />
        <Payables id="accounts_payable" />
      </div>
      <FinancialHealth id="financial_health" className="min-h-[300px]" />
    </div>
  );
};

export const SmartDashboard: React.FC = () => {
  const { role } = useRole();
  const { t } = useTranslation();

  return (
    <PageContainer>
      <SectionTitle 
        title={t('executive_dashboard')} 
        subtitle={t('dashboard_welcome')} 
        action={<RoleSelector />}
      />
      
      {role === 'store_owner' && <StoreOwnerLayout />}
      {role === 'cashier' && <CashierLayout />}
      {role === 'warehouse' && <WarehouseLayout />}
      {role === 'accountant' && <AccountantLayout />}
      
    </PageContainer>
  );
};
