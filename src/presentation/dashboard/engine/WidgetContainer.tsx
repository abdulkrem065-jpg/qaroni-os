import React, { useState, useEffect } from 'react';
import { WidgetState } from './WidgetTypes';
import { LocalizedText } from '../../../localization';
import { RefreshCw, Expand, MoreVertical, Sparkles } from 'lucide-react';
import { useTranslation } from '../../../localization';

interface WidgetContainerProps {
  titleKey: string;
  state: WidgetState;
  onRefresh?: () => void;
  onExpand?: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  titleKey,
  state,
  onRefresh,
  onExpand,
  children,
  className = '',
  icon
}) => {
  const { t, direction } = useTranslation();
  const isRtl = direction === 'rtl';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          <LocalizedText tKey={titleKey} namespace="dashboard" className="font-semibold text-slate-800 dark:text-slate-200" />
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button onClick={onRefresh} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title={t('action_refresh', undefined, 'dashboard')}>
              <RefreshCw size={14} className={state === 'loading' ? 'animate-spin text-indigo-500' : ''} />
            </button>
          )}
          {onExpand && (
            <button onClick={onExpand} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title={t('action_expand', undefined, 'dashboard')}>
              <Expand size={14} />
            </button>
          )}
          <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="AI Explain">
             <Sparkles size={14} className="text-amber-500" />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 relative">
        {state === 'loading' && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="animate-spin text-indigo-500" />
          </div>
        )}
        
        {state === 'error' && (
          <div className="absolute inset-0 bg-rose-50/90 dark:bg-rose-900/20 z-10 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400">
            <LocalizedText tKey="state_error" namespace="dashboard" className="font-medium" />
            {onRefresh && (
              <button onClick={onRefresh} className="mt-2 text-sm underline hover:no-underline">
                <LocalizedText tKey="action_refresh" namespace="dashboard" />
              </button>
            )}
          </div>
        )}

        {state === 'empty' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-slate-400">
            <LocalizedText tKey="state_empty" namespace="dashboard" />
          </div>
        )}

        <div className={state !== 'success' ? 'opacity-30 pointer-events-none' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};
