-- Migration: Authentication & Multi-Tenant Foundation
-- Adds support for profiles, organizations, branches, roles, permissions, role_permissions, user_roles, and organization_members.

-- 1. Create Core Tables

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    status TEXT CHECK (status IN ('active', 'suspended', 'trialing')) NOT NULL DEFAULT 'trialing',
    subscription_tier TEXT CHECK (subscription_tier IN ('Standard', 'Silver', 'Gold', 'Platinum')) NOT NULL DEFAULT 'Standard',
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name JSONB NOT NULL, -- {"en": "...", "ar": "..."}
    timezone TEXT DEFAULT 'Asia/Muscat' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY, -- References auth.users(id)
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    department TEXT,
    language_preference TEXT CHECK (language_preference IN ('ar', 'en')) DEFAULT 'en' NOT NULL,
    timezone TEXT DEFAULT 'Asia/Muscat' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL for system-wide default roles
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (user_id, role_id, organization_id)
);

CREATE TABLE IF NOT EXISTS public.organization_members (
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, organization_id)
);

-- ==========================================
-- Indexing Strategy
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_branches_org ON public.branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_org ON public.roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- ==========================================
-- Security & Verification Functions
-- ==========================================

-- Check if user is a member of the given organization
CREATE OR REPLACE FUNCTION public.is_org_member(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = p_user_id AND organization_id = p_org_id
    );
END;
$$ LANGUAGE plpgsql;

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id AND p.name = p_permission
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- RLS Enablement
-- ==========================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- 1. Organizations Policies
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations FOR SELECT USING (
    public.is_org_member(auth.uid(), id)
);

CREATE POLICY "Admins can update organization details"
ON public.organizations FOR UPDATE USING (
    public.is_org_member(auth.uid(), id) AND public.has_permission(auth.uid(), 'organization.update')
);

-- 2. Branches Policies
CREATE POLICY "Members can view branches"
ON public.branches FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Admins can manage branches"
ON public.branches FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 3. User Profiles Policies
CREATE POLICY "Users can view and update own profile"
ON public.user_profiles FOR ALL USING (
    auth.uid() = id
);

CREATE POLICY "Members can view profiles of colleagues in same organization"
ON public.user_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om1
        JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid() AND om2.user_id = id
    )
);

-- 4. Roles Policies
CREATE POLICY "System roles and org roles are viewable by members"
ON public.roles FOR SELECT USING (
    is_system_role = true OR public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Admins can manage custom roles"
ON public.roles FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'role.manage')
);

-- 5. Permissions Policies
CREATE POLICY "Anyone authenticated can view permissions list"
ON public.permissions FOR SELECT TO authenticated USING (true);

-- 6. Role Permissions Policies
CREATE POLICY "Anyone authenticated can view role permission mappings"
ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update role permission mappings"
ON public.role_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.roles r
        WHERE r.id = role_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'role.manage')
    )
);

-- 7. User Roles Policies
CREATE POLICY "Members can view user role assignments"
ON public.user_roles FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Admins can manage user role assignments"
ON public.user_roles FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'role.manage')
);

-- 8. Organization Members Policies
CREATE POLICY "Members can view organization membership roster"
ON public.organization_members FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Admins can manage memberships"
ON public.organization_members FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'profile.manage')
);

-- ==========================================
-- Seed Basic Data
-- ==========================================

-- Seed default system permissions
INSERT INTO public.permissions (name, description) VALUES
('organization.view', 'Ability to view organization configuration settings'),
('organization.update', 'Ability to modify organization branding, status and billing parameters'),
('branch.manage', 'Ability to create, update or archive branches and location hours'),
('profile.view', 'Ability to view user profiles'),
('profile.manage', 'Ability to invite, edit or suspend organization staff and member accounts'),
('role.manage', 'Ability to create custom roles and modify permission matrices'),
('resource.manage', 'Ability to manage meeting rooms, offices, equipment and rates'),
('booking.manage', 'Ability to manage, override or cancel user reservations'),
('payment.view', 'Ability to view billing histories and invoices'),
('crm.manage', 'Ability to configure CRM queue syncing triggers')
ON CONFLICT (name) DO NOTHING;

-- Seed default system roles
INSERT INTO public.roles (name, description, is_system_role) VALUES
('Owner', 'Full global administrative ownership over the tenant organization', true),
('Admin', 'Organization administrator with configuration and workforce management privileges', true),
('Manager', 'Workspace operations manager managing tasks, calendars and check-ins', true),
('Receptionist', 'Front-desk associate checking in guests and managing bookings', true),
('Staff', 'Operations cleaning and technical technicians processing tasks', true),
('Customer', 'Workspace member making room reservations and checking payments', true)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Link default permissions to system roles
DO $$
DECLARE
    r_owner_id UUID;
    r_admin_id UUID;
    r_manager_id UUID;
    r_staff_id UUID;
    r_cust_id UUID;
    p_org_view UUID;
    p_org_upd UUID;
    p_br_mng UUID;
    p_prof_view UUID;
    p_prof_mng UUID;
    p_role_mng UUID;
    p_res_mng UUID;
    p_book_mng UUID;
    p_pay_view UUID;
BEGIN
    -- Fetch role IDs
    SELECT id INTO r_owner_id FROM public.roles WHERE name = 'Owner' AND organization_id IS NULL;
    SELECT id INTO r_admin_id FROM public.roles WHERE name = 'Admin' AND organization_id IS NULL;
    SELECT id INTO r_manager_id FROM public.roles WHERE name = 'Manager' AND organization_id IS NULL;
    SELECT id INTO r_staff_id FROM public.roles WHERE name = 'Staff' AND organization_id IS NULL;
    SELECT id INTO r_cust_id FROM public.roles WHERE name = 'Customer' AND organization_id IS NULL;

    -- Fetch permission IDs
    SELECT id INTO p_org_view FROM public.permissions WHERE name = 'organization.view';
    SELECT id INTO p_org_upd FROM public.permissions WHERE name = 'organization.update';
    SELECT id INTO p_br_mng FROM public.permissions WHERE name = 'branch.manage';
    SELECT id INTO p_prof_view FROM public.permissions WHERE name = 'profile.view';
    SELECT id INTO p_prof_mng FROM public.permissions WHERE name = 'profile.manage';
    SELECT id INTO p_role_mng FROM public.permissions WHERE name = 'role.manage';
    SELECT id INTO p_res_mng FROM public.permissions WHERE name = 'resource.manage';
    SELECT id INTO p_book_mng FROM public.permissions WHERE name = 'booking.manage';
    SELECT id INTO p_pay_view FROM public.permissions WHERE name = 'payment.view';

    -- Owner Permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_owner_id, p_org_view), (r_owner_id, p_org_upd), (r_owner_id, p_br_mng),
    (r_owner_id, p_prof_view), (r_owner_id, p_prof_mng), (r_owner_id, p_role_mng),
    (r_owner_id, p_res_mng), (r_owner_id, p_book_mng), (r_owner_id, p_pay_view)
    ON CONFLICT DO NOTHING;

    -- Admin Permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_admin_id, p_org_view), (r_admin_id, p_org_upd), (r_admin_id, p_br_mng),
    (r_admin_id, p_prof_view), (r_admin_id, p_prof_mng), (r_admin_id, p_role_mng),
    (r_admin_id, p_res_mng), (r_admin_id, p_book_mng), (r_admin_id, p_pay_view)
    ON CONFLICT DO NOTHING;

    -- Manager Permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_manager_id, p_org_view), (r_manager_id, p_prof_view), (r_manager_id, p_res_mng),
    (r_manager_id, p_book_mng), (r_manager_id, p_pay_view)
    ON CONFLICT DO NOTHING;

    -- Staff Permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_staff_id, p_prof_view)
    ON CONFLICT DO NOTHING;

    -- Customer Permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_cust_id, p_org_view)
    ON CONFLICT DO NOTHING;
END $$;
