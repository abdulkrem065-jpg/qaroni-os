import React, { createContext, useContext, useState } from 'react';

export type DashboardRole = 'store_owner' | 'cashier' | 'warehouse' | 'accountant';

interface RoleContextType {
  role: DashboardRole;
  setRole: (role: DashboardRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<DashboardRole>('store_owner');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};
