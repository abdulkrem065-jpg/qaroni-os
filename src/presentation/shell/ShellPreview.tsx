import React from 'react';
import { ShellProvider } from './context/ShellContext';
import { LocalizationProvider } from '../../localization/providers/LocalizationProvider';
import { AppShell } from './components/AppShell';
import { SmartDashboard } from '../dashboard/layouts/SmartDashboard';
import { RoleProvider } from '../dashboard/engine/RoleContext';

export const ShellPreview: React.FC = () => {
  return (
    <LocalizationProvider>
      <ShellProvider>
        <RoleProvider>
          <AppShell>
            <SmartDashboard />
          </AppShell>
        </RoleProvider>
      </ShellProvider>
    </LocalizationProvider>
  );
};

export default ShellPreview;
