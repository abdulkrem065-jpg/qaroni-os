import React from 'react';
import { useLocalization } from '../providers/LocalizationProvider';

interface LocalizedNumberProps {
  value: number;
  options?: Intl.NumberFormatOptions;
  className?: string;
  as?: React.ElementType;
}

export const LocalizedNumber: React.FC<LocalizedNumberProps> = ({ 
  value, 
  options, 
  className,
  as: Component = 'span'
}) => {
  const { formatNumber } = useLocalization();
  return <Component className={className}>{formatNumber(value, options)}</Component>;
};
