import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-[var(--qeos-card)] rounded-xl border border-[var(--qeos-border)] shadow-sm overflow-hidden ${noPadding ? '' : 'p-4 md:p-6'} ${className}`}>
      {children}
    </div>
  );
};
