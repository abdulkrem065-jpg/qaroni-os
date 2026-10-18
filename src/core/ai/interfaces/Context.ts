export interface AIContext {
  organizationId: string;
  branchId: string;
  userId: string;
  role: string;
  permissions: string[];
  
  environment: {
    language: 'ar' | 'en' | string;
    theme: 'light' | 'dark';
    timezone: string;
  };

  applicationState: {
    currentScreen: string;
    currentWidget?: string;
    selectedRecordId?: string;
    activeKPIs: Record<string, any>;
  };
  
  businessState: {
    financialStateSummary?: string;
    recentActivities?: string[];
  };
}

export interface AIContextEngine {
  buildContext(): Promise<AIContext>;
  serializeContext(context: AIContext): string;
}
