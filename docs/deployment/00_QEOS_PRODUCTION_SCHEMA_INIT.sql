-- QEOS PRODUCTION DATABASE PROVISIONING
-- Authorization: QEOS-AUTH-0083

-- 1. Enable Row Level Security globally
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Create Multi-Tenant Isolation Policies
CREATE POLICY tenant_isolation_policy ON public.orders
    FOR ALL
    USING (organization_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY tenant_isolation_policy_products ON public.products
    FOR ALL
    USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- 3. Required Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON public.orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON public.products(organization_id);

-- End of Provisioning Schema
