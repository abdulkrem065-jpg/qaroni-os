import React from 'react';
import { useShell } from '../context/ShellContext';
import { useLocalization } from '../../../localization/providers/LocalizationProvider';
import { Menu, Search, Bell, Moon, Sun, Languages } from 'lucide-react';
import { LocalizedText } from '../../../localization/components/LocalizedText';

export const Header: React.FC = () => {
  const { toggleSidebar, sidebarOpen, isDark, toggleTheme } = useShell();
  const { language, setLanguage, t } = useLocalization();

  const toggleRtl = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[var(--qeos-header)] border-b border-[var(--qeos-header-border)] transition-all duration-300 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={t("toggle_sidebar")}
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder={t("search")}
            className="bg-transparent border-none outline-none w-full px-2 text-sm text-[var(--qeos-text)] placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          aria-label={t("toggle_theme")}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={toggleRtl}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title={t("switch_language")}
        >
          <Languages size={20} />
        </button>

        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--qeos-header)]"></span>
        </button>

        <div className="h-8 w-px bg-[var(--qeos-header-border)] mx-1 lg:mx-2"></div>

        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            AD
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <LocalizedText tKey="system_admin" className="text-sm font-medium text-[var(--qeos-text)] leading-none" />
            <LocalizedText tKey="main_branch" className="text-xs text-slate-500 mt-1 leading-none" />
          </div>
        </button>
      </div>
    </header>
  );
};
