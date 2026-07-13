-- Migration: BCOS Resource Management System Schema
-- Adds support for resource categories, features, configurations, dynamic pricings, setups, and availability calendars.

-- 1. Resource Types (Categories)
CREATE TABLE IF NOT EXISTS public.resource_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name JSONB NOT NULL, -- {"en": "Meeting Room", "ar": "غرفة اجتماع"}
    code TEXT NOT NULL,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, code)
);

-- 2. Resources (Spaces & Assets)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_type_id UUID REFERENCES public.resource_types(id) ON DELETE RESTRICT NOT NULL,
    name JSONB NOT NULL, -- {"en": "...", "ar": "..."}
    code TEXT NOT NULL,
    description JSONB,
    capacity INTEGER NOT NULL DEFAULT 1,
    min_capacity INTEGER DEFAULT 1 NOT NULL,
    max_capacity INTEGER DEFAULT 1 NOT NULL,
    floor TEXT,
    location TEXT,
    area_size NUMERIC(6,2), -- in sqm
    status TEXT CHECK (status IN ('Available', 'Reserved', 'Occupied', 'Maintenance', 'Cleaning', 'Unavailable', 'Archived')) DEFAULT 'Available' NOT NULL,
    visibility TEXT CHECK (visibility IN ('public', 'private', 'hidden')) DEFAULT 'public' NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, code)
);

-- 3. Resource Features (Amenities)
CREATE TABLE IF NOT EXISTS public.resource_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name JSONB NOT NULL, -- {"en": "Projector", "ar": "جهاز عرض"}
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, code)
);

-- 4. Resource Feature Values (Mapping)
CREATE TABLE IF NOT EXISTS public.resource_feature_values (
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    feature_id UUID REFERENCES public.resource_features(id) ON DELETE CASCADE NOT NULL,
    value TEXT, -- e.g. "4K" or "Yes"
    PRIMARY KEY (resource_id, feature_id)
);

-- 5. Resource Images
CREATE TABLE IF NOT EXISTS public.resource_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Resource Pricing configurations
CREATE TABLE IF NOT EXISTS public.resource_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    price_type TEXT CHECK (price_type IN ('hourly', 'half_day', 'full_day', 'weekend', 'corporate', 'member', 'custom')) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'OMR' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id, price_type)
);

-- 7. Resource Setup configurations
CREATE TABLE IF NOT EXISTS public.resource_setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    setup_type TEXT CHECK (setup_type IN ('Classroom', 'U-Shape', 'Theater', 'Boardroom', 'Workshop', 'Interview', 'Custom')) NOT NULL,
    capacity INTEGER NOT NULL,
    image_url TEXT,
    description JSONB,
    additional_cost NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id, setup_type)
);

-- 8. Resource Availability Rules (Operational hours per day)
CREATE TABLE IF NOT EXISTS public.resource_availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    min_duration_minutes INTEGER DEFAULT 60 NOT NULL,
    max_duration_minutes INTEGER DEFAULT 480 NOT NULL,
    buffer_time_minutes INTEGER DEFAULT 15 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id, day_of_week)
);

-- 9. Resource Blackout Dates (Blocked Maintenance Blocks)
CREATE TABLE IF NOT EXISTS public.resource_blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Indexing Strategy
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type_id);
CREATE INDEX IF NOT EXISTS idx_resources_org_lookup ON public.resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_pricing_resource ON public.resource_pricing(resource_id);
CREATE INDEX IF NOT EXISTS idx_setups_resource ON public.resource_setups(resource_id);
CREATE INDEX IF NOT EXISTS idx_rules_resource ON public.resource_availability_rules(resource_id);
CREATE INDEX IF NOT EXISTS idx_blackouts_resource ON public.resource_blackout_dates(resource_id);

-- ==========================================
-- RLS Enablement
-- ==========================================

ALTER TABLE public.resource_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_feature_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_blackout_dates ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Helper checks already exist: public.is_org_member() and public.has_permission()

-- 1. Resource Types Policies
CREATE POLICY "Members can view resource types"
ON public.resource_types FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage resource types"
ON public.resource_types FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'resource.manage')
);

-- 2. Resources Policies
CREATE POLICY "Members can view spaces list"
ON public.resources FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage resources"
ON public.resources FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'resource.manage')
);

-- 3. Resource Features Policies
CREATE POLICY "Members can view features list"
ON public.resource_features FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage feature templates"
ON public.resource_features FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'resource.manage')
);

-- 4. Resource Feature Values Policies
CREATE POLICY "Members can view room feature values"
ON public.resource_feature_values FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage room feature values"
ON public.resource_feature_values FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- 5. Resource Images Policies
CREATE POLICY "Members can view images"
ON public.resource_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage images"
ON public.resource_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- 6. Resource Pricing Policies
CREATE POLICY "Members can view price rates"
ON public.resource_pricing FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage pricing"
ON public.resource_pricing FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- 7. Resource Setups Policies
CREATE POLICY "Members can view setups"
ON public.resource_setups FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage setups"
ON public.resource_setups FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- 8. Availability Rules Policies
CREATE POLICY "Members can view availability rules"
ON public.resource_availability_rules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage availability rules"
ON public.resource_availability_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- 9. Blackout Dates Policies
CREATE POLICY "Members can view blocked calendar dates"
ON public.resource_blackout_dates FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id))
);

CREATE POLICY "Admins can manage blackout dates"
ON public.resource_blackout_dates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_org_member(auth.uid(), r.organization_id) AND public.has_permission(auth.uid(), 'resource.manage'))
);

-- ==========================================
-- Seed Base Data
-- ==========================================

-- Seed default resource types
-- Note: Developers must update organization_id link when initializing organizations.
