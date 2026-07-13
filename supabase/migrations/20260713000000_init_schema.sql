-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles (Users & Roles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- References auth.users(id)
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('SuperAdmin', 'OrgAdmin', 'Staff', 'Customer')) NOT NULL DEFAULT 'Customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Resources (Rooms, Desks, Studios, etc.)
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name JSONB NOT NULL, -- Bilingual format: {"en": "...", "ar": "..."}
    description JSONB,   -- Bilingual format
    type TEXT NOT NULL CHECK (type IN ('meeting_room', 'hot_desk', 'dedicated_desk', 'podcast_studio', 'training_hall', 'office')),
    capacity INTEGER NOT NULL DEFAULT 1,
    base_price_hourly NUMERIC(10,2),
    base_price_daily NUMERIC(10,2),
    base_price_weekly NUMERIC(10,2),
    base_price_monthly NUMERIC(10,2),
    setup_buffer_minutes INTEGER NOT NULL DEFAULT 0,
    teardown_buffer_minutes INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Addons (Catering, Hardware, Staff Services)
CREATE TABLE public.addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name JSONB NOT NULL, -- Bilingual format
    description JSONB,
    price NUMERIC(10,2) NOT NULL,
    price_type TEXT NOT NULL CHECK (price_type IN ('once', 'hourly', 'daily')),
    category TEXT NOT NULL CHECK (category IN ('catering', 'staff', 'hardware', 'business')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Quoted', 'Confirmed', 'Paid', 'Completed', 'Cancelled')) DEFAULT 'Quoted',
    booking_type TEXT NOT NULL CHECK (booking_type IN ('hourly', 'half_day', 'full_day', 'multi_day', 'recurring', 'corporate', 'internal')),
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Booking Addons (Join Table)
CREATE TABLE public.booking_addons (
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    addon_id UUID REFERENCES public.addons(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (booking_id, addon_id)
);

-- 7. Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Sent', 'Paid', 'Void', 'Overdue')) DEFAULT 'Draft',
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00, -- 15% VAT default
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stripe_payment_intent_id TEXT,
    stripe_payment_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Invoice Items
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- 9. Audit Logs (Immutable History)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    organization_id UUID,
    user_id UUID,
    table_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_payload JSONB,
    new_payload JSONB,
    ip_address TEXT,
    user_agent TEXT
);

-- 10. GHL Sync Queue (Outbox pattern for async sync to CRM)
CREATE TABLE public.ghl_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('Contact', 'Company', 'Booking', 'Invoice')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('upsert', 'delete')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Security & RLS Helper Functions
-- ==========================================

-- Get organization ID of current user
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID SECURITY DEFINER AS $$
BEGIN
    RETURN (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- Get role of current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT SECURITY DEFINER AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Enable Row-Level Security (RLS)
-- ==========================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_sync_queue ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Organizations Policies
CREATE POLICY "SuperAdmin can manage organizations" 
ON public.organizations FOR ALL USING (public.get_user_role() = 'SuperAdmin');

CREATE POLICY "Org members can view own organization" 
ON public.organizations FOR SELECT USING (id = public.get_user_org_id());

-- Profiles Policies
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "OrgAdmins and Staff can view profiles in organization" 
ON public.profiles FOR SELECT USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() IN ('OrgAdmin', 'Staff')
);

CREATE POLICY "OrgAdmins can manage profiles in organization" 
ON public.profiles FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() = 'OrgAdmin'
);

-- Resources Policies
CREATE POLICY "Anyone in organization can view resources" 
ON public.resources FOR SELECT USING (organization_id = public.get_user_org_id());

CREATE POLICY "OrgAdmins can manage resources" 
ON public.resources FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() = 'OrgAdmin'
);

-- Addons Policies
CREATE POLICY "Anyone in organization can view addons" 
ON public.addons FOR SELECT USING (organization_id = public.get_user_org_id());

CREATE POLICY "OrgAdmins can manage addons" 
ON public.addons FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() = 'OrgAdmin'
);

-- Bookings Policies
CREATE POLICY "Customers can manage own bookings" 
ON public.bookings FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    profile_id = auth.uid()
);

CREATE POLICY "OrgAdmins and Staff can manage all bookings in organization" 
ON public.bookings FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() IN ('OrgAdmin', 'Staff')
);

-- Booking Addons Policies
CREATE POLICY "Customers can manage own booking addons" 
ON public.booking_addons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = booking_id AND b.profile_id = auth.uid()
    )
);

CREATE POLICY "OrgAdmins and Staff can manage all booking addons in organization" 
ON public.booking_addons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = booking_id AND b.organization_id = public.get_user_org_id() AND public.get_user_role() IN ('OrgAdmin', 'Staff')
    )
);

-- Invoices Policies
CREATE POLICY "Customers can read own invoices" 
ON public.invoices FOR SELECT USING (
    organization_id = public.get_user_org_id() AND 
    profile_id = auth.uid()
);

CREATE POLICY "OrgAdmins and Staff can manage invoices" 
ON public.invoices FOR ALL USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() IN ('OrgAdmin', 'Staff')
);

-- Invoice Items Policies
CREATE POLICY "Customers can read own invoice items" 
ON public.invoice_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices i 
        WHERE i.id = invoice_id AND i.profile_id = auth.uid()
    )
);

CREATE POLICY "OrgAdmins and Staff can manage invoice items" 
ON public.invoice_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.invoices i 
        WHERE i.id = invoice_id AND i.organization_id = public.get_user_org_id() AND public.get_user_role() IN ('OrgAdmin', 'Staff')
    )
);

-- Audit Logs Policies (Read-Only access to Admins/SuperAdmins, immutable)
CREATE POLICY "SuperAdmins can view all audit logs" 
ON public.audit_logs FOR SELECT USING (public.get_user_role() = 'SuperAdmin');

CREATE POLICY "OrgAdmins can view organization audit logs" 
ON public.audit_logs FOR SELECT USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() = 'OrgAdmin'
);

-- GHL Sync Queue Policies (Internal system access or Admin review)
CREATE POLICY "OrgAdmins and Staff can view sync queue" 
ON public.ghl_sync_queue FOR SELECT USING (
    organization_id = public.get_user_org_id() AND 
    public.get_user_role() IN ('OrgAdmin', 'Staff')
);

-- ==========================================
-- Audit Trigger Implementation
-- ==========================================

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
BEGIN
    -- Attempt to get user ID
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Resolve organization ID based on operation
    IF TG_OP = 'DELETE' THEN
        v_org_id := OLD.organization_id;
    ELSE
        v_org_id := NEW.organization_id;
    END if;

    -- Skip audit log table itself to prevent recursion (should not happen anyway)
    IF TG_TABLE_NAME = 'audit_logs' THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.audit_logs (
        organization_id,
        user_id,
        table_name,
        action_type,
        old_payload,
        new_payload
    ) VALUES (
        v_org_id,
        v_user_id,
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach Audit Triggers
CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_resources_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_addons_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.addons
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_bookings_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_invoices_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
