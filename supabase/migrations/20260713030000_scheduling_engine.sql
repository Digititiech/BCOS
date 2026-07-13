-- Migration: BCOS Availability & Scheduling Engine Schema
-- Adds support for working hours, availability thresholds, block periods, exceptions, buffers, and system calendar occupancy logs.

-- 1. Resource Working Hours
CREATE TABLE IF NOT EXISTS public.resource_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id, day_of_week)
);

-- 2. Resource Availability Rules (Operational Constraints)
CREATE TABLE IF NOT EXISTS public.resource_availability_rules_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    min_duration_minutes INTEGER DEFAULT 60 NOT NULL,
    max_duration_minutes INTEGER DEFAULT 480 NOT NULL,
    advance_booking_days INTEGER DEFAULT 90 NOT NULL,
    allow_same_day BOOLEAN DEFAULT true NOT NULL,
    lead_time_hours INTEGER DEFAULT 2 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id)
);

-- 3. Resource Buffers
CREATE TABLE IF NOT EXISTS public.resource_buffers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    buffer_before_minutes INTEGER DEFAULT 0 NOT NULL,
    buffer_after_minutes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (resource_id)
);

-- 4. Resource Blocked Periods
CREATE TABLE IF NOT EXISTS public.resource_blocked_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Active', 'Completed')) DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Resource Holidays
CREATE TABLE IF NOT EXISTS public.resource_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE, -- NULL means organization-wide holiday
    holiday_date DATE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (organization_id, resource_id, holiday_date)
);

-- 6. Resource Time Exceptions (Seasonal Changes)
CREATE TABLE IF NOT EXISTS public.resource_time_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Calendar Occupied Events (For calculating conflicts)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Indexing Strategy
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_work_hours_resource ON public.resource_working_hours(resource_id);
CREATE INDEX IF NOT EXISTS idx_blocked_periods_range ON public.resource_blocked_periods(resource_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.resource_holidays(organization_id, holiday_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_range ON public.calendar_events(resource_id, start_time, end_time);

-- ==========================================
-- RLS Enablement
-- ==========================================

ALTER TABLE public.resource_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_availability_rules_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_buffers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_blocked_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_time_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- 1. Working Hours Policies
CREATE POLICY "Members can view working hours"
ON public.resource_working_hours FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage working hours"
ON public.resource_working_hours FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 2. Availability Rules Policies
CREATE POLICY "Members can view extended rules"
ON public.resource_availability_rules_extended FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage extended rules"
ON public.resource_availability_rules_extended FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 3. Resource Buffers Policies
CREATE POLICY "Members can view buffers"
ON public.resource_buffers FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage buffers"
ON public.resource_buffers FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 4. Blocked Periods Policies
CREATE POLICY "Members can view blocked periods"
ON public.resource_blocked_periods FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage blocked periods"
ON public.resource_blocked_periods FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 5. Holidays Policies
CREATE POLICY "Members can view holidays"
ON public.resource_holidays FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage holidays"
ON public.resource_holidays FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 6. Time Exceptions Policies
CREATE POLICY "Members can view exceptions"
ON public.resource_time_exceptions FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage exceptions"
ON public.resource_time_exceptions FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);

-- 7. Calendar Events Policies
CREATE POLICY "Members can view calendar events"
ON public.calendar_events FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage calendar events"
ON public.calendar_events FOR ALL USING (
    public.is_org_member(auth.uid(), organization_id) AND public.has_permission(auth.uid(), 'branch.manage')
);
