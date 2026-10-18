import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TranslationResolver, InterpolationValues } from '../language-engine/TranslationResolver';
import { Formatters } from '../language-engine/Formatters';

// Pre-load common namespaces. In a full dynamic system, these would be lazily loaded.
import arCommon from '../languages/ar/common.json';
import enCommon from '../languages/en/common.json';

export type SupportedLanguage = 'ar' | 'en';

import arDashboard from "../languages/ar/dashboard.json";
import enDashboard from "../languages/en/dashboard.json";
export interface LocalizationContextType {
  language: SupportedLanguage;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, values?: InterpolationValues, namespace?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (amount: number, options?: Intl.NumberFormatOptions) => string;
  formatPercentage: (value: number) => string;
}

const resources: Record<SupportedLanguage, Record<string, any>> = {
  ar: { common: arCommon, dashboard: arDashboard },
  en: { common: enCommon, dashboard: enDashboard }
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('ar');

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('qeos_language', lang);
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('qeos_language');
      if (stored === 'ar' || stored === 'en') {
        setLanguageState(stored as SupportedLanguage);
      }
    } catch (e) {}
  }, []);

  const t = (key: string, values?: InterpolationValues, namespace: string = 'common') => {
    const langResources = resources[language]?.[namespace] || {};
    const fallbackLangResources = resources['ar']?.[namespace] || {};
    return TranslationResolver.resolve(key, langResources, values, fallbackLangResources);
  };

  const contextValue = useMemo<LocalizationContextType>(() => ({
    language,
    direction,
    setLanguage,
    t,
    formatDate: (date, options) => Formatters.formatDate(date, language, options),
    formatTime: (date, options) => Formatters.formatTime(date, language, options),
    formatCurrency: (amount, currency = 'IQD') => Formatters.formatCurrency(amount, language, currency),
    formatNumber: (amount, options) => Formatters.formatNumber(amount, language, options),
    formatPercentage: (value) => Formatters.formatPercentage(value, language)
  }), [language, direction]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

// Aliases for cleaner imports in components
export const useTranslation = () => {
  const { t, language, direction } = useLocalization();
  return { t, language, direction };
};
