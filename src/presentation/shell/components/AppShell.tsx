import React from 'react';
import { useShell } from '../context/ShellContext';
import { useLocalization } from '../../../localization/providers/LocalizationProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Workspace } from './Workspace';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen } = useShell();
  const { direction } = useLocalization();
  const isRtl = direction === 'rtl';

  return (
    <div className="flex h-screen bg-[var(--qeos-bg)] text-[var(--qeos-text)] font-sans antialiased overflow-hidden">
      <Sidebar />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${sidebarOpen ? (isRtl ? 'lg:mr-64' : 'lg:ml-64') : (isRtl ? 'lg:mr-20' : 'lg:ml-20')}
        `}
      >
        <Header />
        <Workspace>
          {children}
        </Workspace>
      </div>
    </div>
  );
};
