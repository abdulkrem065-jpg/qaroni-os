import React from 'react';
import { WidgetComponent } from '../engine/WidgetTypes';
import { WidgetContainer } from '../engine/WidgetContainer';
import { LocalizedText } from '../../../localization';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { WidgetRegistry } from '../engine/WidgetRegistry';

export const InventoryAlertsWidget: WidgetComponent = ({ id, className }) => {
  return (
    <WidgetContainer titleKey="inventory_alerts" state="success" className={className} icon={<AlertTriangle size={18} />}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400">
          <span className="font-medium">Milk 1L</span>
          <span className="text-sm font-bold">2 left</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
          <span className="font-medium">Bread</span>
          <span className="text-sm font-bold">15 left</span>
        </div>
      </div>
    </WidgetContainer>
  );
};
InventoryAlertsWidget.metadata = { id: 'inventory_alerts', version: '1.0', category: 'inventory' };
WidgetRegistry.register(InventoryAlertsWidget);

export const TopSellingProductsWidget: WidgetComponent = ({ id, className }) => {
  return (
    <WidgetContainer titleKey="top_selling_products" state="success" className={className} icon={<Package size={18} />}>
      <div className="space-y-2">
        {['Coffee Beans', 'Sugar 1kg', 'Tea Bags'].map((item, i) => (
          <div key={item} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{i + 1}. {item}</span>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};
TopSellingProductsWidget.metadata = { id: 'top_selling_products', version: '1.0', category: 'inventory' };
WidgetRegistry.register(TopSellingProductsWidget);

export const SlowMovingProductsWidget: WidgetComponent = ({ id, className }) => {
  return (
    <WidgetContainer titleKey="slow_moving_products" state="success" className={className} icon={<TrendingDown size={18} />}>
      <div className="space-y-2">
        {['Premium Olive Oil', 'Imported Cheese'].map((item) => (
          <div key={item} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};
SlowMovingProductsWidget.metadata = { id: 'slow_moving_products', version: '1.0', category: 'inventory' };
WidgetRegistry.register(SlowMovingProductsWidget);
