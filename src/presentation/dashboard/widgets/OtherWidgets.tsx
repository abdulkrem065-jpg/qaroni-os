import React from 'react';
import { WidgetComponent } from '../engine/WidgetTypes';
import { WidgetContainer } from '../engine/WidgetContainer';
import { LocalizedText } from '../../../localization';
import { Activity, Bell, Zap, FileText, ShoppingBag, BarChart3, Users } from 'lucide-react';
import { WidgetRegistry } from '../engine/WidgetRegistry';

const MockWidget = (titleKey: string, category: any, icon: any, id: string): WidgetComponent => {
  const Widget: WidgetComponent = ({ className }) => (
    <WidgetContainer titleKey={titleKey} state="success" className={className} icon={icon}>
      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
        <span className="text-slate-400 text-sm"><LocalizedText tKey={titleKey} namespace="dashboard" /> Data</span>
      </div>
    </WidgetContainer>
  );
  Widget.metadata = { id, version: '1.0', category };
  WidgetRegistry.register(Widget);
  return Widget;
};

export const ExecutiveSummaryWidget = MockWidget('executive_summary', 'operations', <BarChart3 size={18} />, 'executive_summary');
export const TodaysPurchasesWidget = MockWidget('todays_purchases', 'inventory', <ShoppingBag size={18} />, 'todays_purchases');
export const StoreHealthWidget = MockWidget('store_health', 'operations', <Activity size={18} />, 'store_health');
export const FinancialHealthWidget = MockWidget('financial_health', 'financial', <Activity size={18} />, 'financial_health');
export const BranchPerformanceWidget = MockWidget('branch_performance', 'operations', <BarChart3 size={18} />, 'branch_performance');
export const StaffActivitySummaryWidget = MockWidget('staff_activity', 'hr', <Users size={18} />, 'staff_activity');
export const RecentTransactionsWidget = MockWidget('recent_transactions', 'sales', <FileText size={18} />, 'recent_transactions');
export const NotificationsSummaryWidget = MockWidget('notifications_summary', 'operations', <Bell size={18} />, 'notifications_summary');
export const QuickActionsPanelWidget = MockWidget('quick_actions', 'operations', <Zap size={18} />, 'quick_actions');

