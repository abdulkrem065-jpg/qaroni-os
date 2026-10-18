import React from 'react';
import { useLocalization } from '../providers/LocalizationProvider';

interface LocalizedDateProps {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  as?: React.ElementType;
}

export const LocalizedDate: React.FC<LocalizedDateProps> = ({ 
  date, 
  options, 
  className,
  as: Component = 'span'
}) => {
  const { formatDate } = useLocalization();
  return <Component className={className}>{formatDate(date, options)}</Component>;
};
