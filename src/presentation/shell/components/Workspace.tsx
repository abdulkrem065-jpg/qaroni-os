import React from 'react';

export const Workspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--qeos-bg)]">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {children}
      </div>
    </main>
  );
};
