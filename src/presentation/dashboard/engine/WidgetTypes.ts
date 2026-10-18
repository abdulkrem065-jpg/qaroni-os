import React from 'react';

export type WidgetState = 'loading' | 'success' | 'empty' | 'offline' | 'warning' | 'critical' | 'error';
export type WidgetCategory = 'financial' | 'inventory' | 'sales' | 'operations' | 'hr';

export interface WidgetMetadata {
  id: string;
  version: string;
  category: WidgetCategory;
  requiredPermissions?: string[];
  requiredFlags?: string[];
  descriptionKey?: string; // For AI
}

export interface WidgetProps {
  id: string;
  className?: string;
}

export interface WidgetComponent extends React.FC<WidgetProps> {
  metadata: WidgetMetadata;
}
