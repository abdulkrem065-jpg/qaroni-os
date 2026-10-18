import React from 'react';
import { useLocalization } from '../providers/LocalizationProvider';

interface LocalizedCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
  as?: React.ElementType;
}

export const LocalizedCurrency: React.FC<LocalizedCurrencyProps> = ({ 
  amount, 
  currency = 'IQD', 
  className,
  as: Component = 'span'
}) => {
  const { formatCurrency } = useLocalization();
  return <Component className={className} dir="ltr">{formatCurrency(amount, currency)}</Component>;
};
