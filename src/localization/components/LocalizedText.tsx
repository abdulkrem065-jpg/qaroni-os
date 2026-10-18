import React from 'react';
import { useTranslation } from '../providers/LocalizationProvider';
import { InterpolationValues } from '../language-engine/TranslationResolver';

interface LocalizedTextProps {
  tKey: string;
  values?: InterpolationValues;
  namespace?: string;
  className?: string;
  as?: React.ElementType;
}

export const LocalizedText: React.FC<LocalizedTextProps> = ({ 
  tKey, 
  values, 
  namespace = 'common', 
  className,
  as: Component = 'span' 
}) => {
  const { t } = useTranslation();
  return <Component className={className}>{t(tKey, values, namespace)}</Component>;
};
