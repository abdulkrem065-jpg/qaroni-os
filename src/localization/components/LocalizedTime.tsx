import React from 'react';
import { useLocalization } from '../providers/LocalizationProvider';

interface LocalizedTimeProps {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  as?: React.ElementType;
}

export const LocalizedTime: React.FC<LocalizedTimeProps> = ({ 
  date, 
  options, 
  className,
  as: Component = 'span'
}) => {
  const { formatTime } = useLocalization();
  return <Component className={className} dir="ltr">{formatTime(date, options)}</Component>;
};
