import React from 'react';
import { useRole, DashboardRole } from '../engine/RoleContext';
import { useTranslation } from '../../../localization';
import { Users } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const { role, setRole } = useRole();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
      <Users size={16} className="text-slate-400" />
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value as DashboardRole)}
        className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
      >
        <option value="store_owner">{t('role_store_owner', undefined, 'dashboard')}</option>
        <option value="cashier">{t('role_cashier', undefined, 'dashboard')}</option>
        <option value="warehouse">{t('role_warehouse', undefined, 'dashboard')}</option>
        <option value="accountant">{t('role_accountant', undefined, 'dashboard')}</option>
      </select>
    </div>
  );
};
