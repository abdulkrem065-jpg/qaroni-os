import React from 'react';
import { useShell } from '../context/ShellContext';
import { useLocalization } from '../../../localization/providers/LocalizationProvider';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut } from 'lucide-react';
import { LocalizedText } from '../../../localization/components/LocalizedText';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useShell();
  const { direction } = useLocalization();
  const isRtl = direction === 'rtl';

  return (
    <aside 
      className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 flex flex-col transition-all duration-300 ease-in-out
        bg-[var(--qeos-sidebar)] border-${isRtl ? 'l' : 'r'} border-[var(--qeos-sidebar-border)] text-[var(--qeos-text)]
        ${sidebarOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'}
      `}
      style={{
        transform: !sidebarOpen && window.innerWidth < 1024 
          ? (isRtl ? 'translateX(100%)' : 'translateX(-100%)') 
          : 'translateX(0)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--qeos-sidebar-border)]">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">Q</span>
            </div>
            <span className="text-xl font-bold font-sans">QEOS</span>
          </div>
        )}
        {!sidebarOpen && (
           <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">Q</span>
              </div>
           </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        <NavItem icon={<LayoutDashboard size={20} />} tKey="dashboard" active />
        <NavItem icon={<ShoppingCart size={20} />} tKey="sales" />
        <NavItem icon={<Package size={20} />} tKey="inventory" />
        <NavItem icon={<Users size={20} />} tKey="customers" />
        <NavItem icon={<Settings size={20} />} tKey="settings" />
      </nav>

      <div className="p-4 border-t border-[var(--qeos-sidebar-border)]">
        <NavItem icon={<LogOut size={20} className={isRtl ? "rotate-180" : ""} />} tKey="logout" />
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  tKey: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, tKey, active }) => {
  const { sidebarOpen } = useShell();
  const { t } = useLocalization();
  
  return (
    <button 
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
        ${active 
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' 
          : 'hover:bg-[var(--qeos-sidebar-active)] text-slate-600 dark:text-slate-400'
        }
        ${!sidebarOpen ? 'justify-center' : ''}
      `}
      title={!sidebarOpen ? t(tKey) : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {sidebarOpen && <LocalizedText tKey={tKey} className="truncate" />}
    </button>
  );
};
