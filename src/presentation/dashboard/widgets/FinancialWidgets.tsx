import React, { useState, useEffect } from 'react';
import { WidgetComponent, WidgetProps, WidgetState } from '../engine/WidgetTypes';
import { WidgetContainer } from '../engine/WidgetContainer';
import { LocalizedCurrency, LocalizedText, LocalizedNumber } from '../../../localization';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Receipt } from 'lucide-react';
import { WidgetRegistry } from '../engine/WidgetRegistry';

const useMockData = <T extends any>(data: T, delay = 1000) => {
  const [state, setState] = useState<WidgetState>('loading');
  const [val, setVal] = useState<T | null>(null);

  useEffect(() => {
    setState('loading');
    const timer = setTimeout(() => {
      setVal(data);
      setState('success');
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const refresh = () => {
    setState('loading');
    setTimeout(() => {
      setVal(data);
      setState('success');
    }, 500);
  };

  return { state, data: val, refresh };
};

const MetricDisplay = ({ value, trend, label, isCurrency = true }: { value: number, trend: number, label: string, isCurrency?: boolean }) => (
  <div className="flex flex-col">
    <div className="flex items-end justify-between mb-1">
      <div className="text-3xl font-bold text-slate-800 dark:text-white">
        {isCurrency ? <LocalizedCurrency amount={value} /> : <LocalizedNumber value={value} />}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        <LocalizedNumber value={Math.abs(trend)} options={{ style: 'percent', maximumFractionDigits: 1 }} />
      </span>
      <span className="text-xs text-slate-500"><LocalizedText tKey={label} namespace="dashboard" /></span>
    </div>
  </div>
);

export const TodaysSalesWidget: WidgetComponent = ({ id, className }) => {
  const { state, data, refresh } = useMockData({ value: 4500000, trend: 0.12 });
  return (
    <WidgetContainer titleKey="todays_sales" state={state} onRefresh={refresh} className={className} icon={<DollarSign size={18} />}>
      {data && <MetricDisplay value={data.value} trend={data.trend} label="vs_yesterday" />}
    </WidgetContainer>
  );
};
TodaysSalesWidget.metadata = { id: 'todays_sales', version: '1.0', category: 'sales' };
WidgetRegistry.register(TodaysSalesWidget);

export const TodaysProfitWidget: WidgetComponent = ({ id, className }) => {
  const { state, data, refresh } = useMockData({ value: 1200000, trend: 0.05 });
  return (
    <WidgetContainer titleKey="todays_profit" state={state} onRefresh={refresh} className={className} icon={<TrendingUp size={18} />}>
      {data && <MetricDisplay value={data.value} trend={data.trend} label="vs_yesterday" />}
    </WidgetContainer>
  );
};
TodaysProfitWidget.metadata = { id: 'todays_profit', version: '1.0', category: 'financial' };
WidgetRegistry.register(TodaysProfitWidget);

export const CashPositionWidget: WidgetComponent = ({ id, className }) => {
  const { state, data, refresh } = useMockData({ value: 15400000, trend: -0.02 });
  return (
    <WidgetContainer titleKey="cash_position" state={state} onRefresh={refresh} className={className} icon={<Wallet size={18} />}>
      {data && <MetricDisplay value={data.value} trend={data.trend} label="vs_last_month" />}
    </WidgetContainer>
  );
};
CashPositionWidget.metadata = { id: 'cash_position', version: '1.0', category: 'financial' };
WidgetRegistry.register(CashPositionWidget);

export const AccountsReceivableWidget: WidgetComponent = ({ id, className }) => {
  const { state, data, refresh } = useMockData({ value: 8500000, trend: 0.15 });
  return (
    <WidgetContainer titleKey="accounts_receivable" state={state} onRefresh={refresh} className={className} icon={<Receipt size={18} />}>
      {data && <MetricDisplay value={data.value} trend={data.trend} label="vs_last_month" />}
    </WidgetContainer>
  );
};
AccountsReceivableWidget.metadata = { id: 'accounts_receivable', version: '1.0', category: 'financial' };
WidgetRegistry.register(AccountsReceivableWidget);

export const AccountsPayableWidget: WidgetComponent = ({ id, className }) => {
  const { state, data, refresh } = useMockData({ value: 4200000, trend: -0.08 });
  return (
    <WidgetContainer titleKey="accounts_payable" state={state} onRefresh={refresh} className={className} icon={<CreditCard size={18} />}>
      {data && <MetricDisplay value={data.value} trend={data.trend} label="vs_last_month" />}
    </WidgetContainer>
  );
};
AccountsPayableWidget.metadata = { id: 'accounts_payable', version: '1.0', category: 'financial' };
WidgetRegistry.register(AccountsPayableWidget);
