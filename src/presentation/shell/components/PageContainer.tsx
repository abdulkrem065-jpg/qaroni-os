import React from 'react';

export const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {children}
    </div>
  );
};
