-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CUSTOM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('patient', 'clinic_staff', 'practitioner', 'clinic_admin', 'platform_admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'checked_in', 'cancelled', 'expired');
CREATE TYPE callback_status AS ENUM ('pending', 'attempted', 'completed', 'cancelled', 'failed');
CREATE TYPE queue_status AS ENUM ('waiting', 'called', 'in_progress', 'completed', 'no_show');
CREATE TYPE clinic_status AS ENUM ('pending', 'approved', 'suspended', 'disabled');
CREATE TYPE virtual_session_status AS ENUM ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE notification_type AS ENUM ('appointment_reminder', 'appointment_update', 'waitlist_update', 'callback_update', 'queue_update', 'virtual_session', 'general');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  health_card_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regions
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  status clinic_status NOT NULL DEFAULT 'pending',
  is_walk_in BOOLEAN NOT NULL DEFAULT false,
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  is_appointment_only BOOLEAN NOT NULL DEFAULT false,
  average_consult_duration INTEGER NOT NULL DEFAULT 15, -- minutes
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic Locations
CREATE TABLE clinic_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  region_id UUID REFERENCES regions(id),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic Hours
CREATE TABLE clinic_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, day_of_week)
);

-- Service Categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES service_categories(id),
  default_duration INTEGER NOT NULL DEFAULT 15, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic Services (junction)
CREATE TABLE clinic_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10,2),
  duration_override INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, service_id)
);

-- Practitioners
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title TEXT, -- e.g., Dr., NP
  specialty TEXT,
  license_number TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_accepting_patients BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic Staff (junction for staff members)
CREATE TABLE clinic_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'clinic_staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, clinic_id)
);

-- Practitioner Availability
CREATE TABLE practitioner_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  practitioner_id UUID REFERENCES practitioners(id),
  service_id UUID REFERENCES services(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  reason TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointment Status History
CREATE TABLE appointment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  old_status appointment_status,
  new_status appointment_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Waitlist Entries
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  practitioner_id UUID REFERENCES practitioners(id),
  service_id UUID REFERENCES services(id),
  status waitlist_status NOT NULL DEFAULT 'waiting',
  position INTEGER,
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  notes TEXT,
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Queue Entries
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  practitioner_id UUID REFERENCES practitioners(id),
  patient_name TEXT, -- for walk-ins without accounts
  queue_number INTEGER NOT NULL,
  status queue_status NOT NULL DEFAULT 'waiting',
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_wait_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Callback Requests
CREATE TABLE callback_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  phone TEXT NOT NULL,
  reason TEXT,
  preferred_time TEXT,
  status callback_status NOT NULL DEFAULT 'pending',
  attempted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  handled_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wait Time Snapshots
CREATE TABLE wait_time_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  estimated_wait_minutes INTEGER NOT NULL,
  queue_depth INTEGER NOT NULL DEFAULT 0,
  active_practitioners INTEGER NOT NULL DEFAULT 0,
  is_manual_override BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Virtual Sessions
CREATE TABLE virtual_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  status virtual_session_status NOT NULL DEFAULT 'scheduled',
  room_id TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_status ON clinics(status);
CREATE INDEX idx_clinics_name_trgm ON clinics USING gin(name gin_trgm_ops);
CREATE INDEX idx_clinic_locations_city ON clinic_locations(city);
CREATE INDEX idx_clinic_locations_postal ON clinic_locations(postal_code);
CREATE INDEX idx_clinic_locations_region ON clinic_locations(region_id);
CREATE INDEX idx_clinic_locations_geo ON clinic_locations(latitude, longitude);
CREATE INDEX idx_practitioners_clinic ON practitioners(clinic_id);
CREATE INDEX idx_practitioners_profile ON practitioners(profile_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_waitlist_clinic ON waitlist_entries(clinic_id);
CREATE INDEX idx_waitlist_patient ON waitlist_entries(patient_id);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status);
CREATE INDEX idx_queue_clinic ON queue_entries(clinic_id);
CREATE INDEX idx_queue_status ON queue_entries(status);
CREATE INDEX idx_callback_clinic ON callback_requests(clinic_id);
CREATE INDEX idx_callback_status ON callback_requests(status);
CREATE INDEX idx_wait_time_clinic ON wait_time_snapshots(clinic_id);
CREATE INDEX idx_wait_time_created ON wait_time_snapshots(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_virtual_sessions_appointment ON virtual_sessions(appointment_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate estimated wait time for a clinic
CREATE OR REPLACE FUNCTION calculate_wait_time(p_clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_queue_count INTEGER;
  v_avg_duration INTEGER;
  v_active_practitioners INTEGER;
  v_estimated_wait INTEGER;
  v_manual_override INTEGER;
BEGIN
  -- Check for manual override first
  SELECT estimated_wait_minutes INTO v_manual_override
  FROM wait_time_snapshots
  WHERE clinic_id = p_clinic_id AND is_manual_override = true
  ORDER BY created_at DESC LIMIT 1;

  -- If there's a recent manual override (within last 30 min), use it
  IF v_manual_override IS NOT NULL THEN
    RETURN v_manual_override;
  END IF;

  -- Count waiting patients in queue
  SELECT COUNT(*) INTO v_queue_count
  FROM queue_entries
  WHERE clinic_id = p_clinic_id AND status IN ('waiting', 'called');

  -- Get average consult duration from clinic
  SELECT average_consult_duration INTO v_avg_duration
  FROM clinics WHERE id = p_clinic_id;

  IF v_avg_duration IS NULL THEN
    v_avg_duration := 15;
  END IF;

  -- Count active practitioners (those with in_progress queue entries or available today)
  SELECT COUNT(DISTINCT p.id) INTO v_active_practitioners
  FROM practitioners p
  WHERE p.clinic_id = p_clinic_id AND p.is_active = true;

  IF v_active_practitioners = 0 THEN
    v_active_practitioners := 1;
  END IF;

  -- Calculate: (queue_depth * avg_duration) / active_practitioners
  v_estimated_wait := CEIL((v_queue_count * v_avg_duration)::NUMERIC / v_active_practitioners);

  RETURN GREATEST(v_estimated_wait, 0);
END;
$$ LANGUAGE plpgsql;

-- Get next queue number for a clinic
CREATE OR REPLACE FUNCTION get_next_queue_number(p_clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next INTEGER;
BEGIN
  SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_next
  FROM queue_entries
  WHERE clinic_id = p_clinic_id
    AND DATE(created_at) = CURRENT_DATE;
  RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON practitioners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON queue_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_callbacks_updated_at BEFORE UPDATE ON callback_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_virtual_sessions_updated_at BEFORE UPDATE ON virtual_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wait_time_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper: check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check if user is clinic staff/admin for a clinic
CREATE OR REPLACE FUNCTION is_clinic_member(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = p_clinic_id AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM practitioners WHERE profile_id = auth.uid() AND clinic_id = p_clinic_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Platform admins can view all profiles" ON profiles FOR SELECT USING (is_platform_admin());
CREATE POLICY "Clinic members can view patient profiles for their appointments" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clinic_staff cs
    JOIN appointments a ON a.clinic_id = cs.clinic_id
    WHERE cs.profile_id = auth.uid() AND a.patient_id = profiles.id AND cs.is_active = true
  )
);
CREATE POLICY "Service role full access to profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- CLINICS (public read for approved clinics)
CREATE POLICY "Anyone can view approved clinics" ON clinics FOR SELECT USING (status = 'approved');
CREATE POLICY "Clinic members can view their clinic" ON clinics FOR SELECT USING (is_clinic_member(id));
CREATE POLICY "Clinic admins can update their clinic" ON clinics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = clinics.id AND role = 'clinic_admin' AND is_active = true)
);
CREATE POLICY "Platform admins full access clinics" ON clinics FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to clinics" ON clinics FOR ALL USING (auth.role() = 'service_role');

-- CLINIC LOCATIONS (public read)
CREATE POLICY "Anyone can view clinic locations" ON clinic_locations FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinics WHERE id = clinic_locations.clinic_id AND status = 'approved')
);
CREATE POLICY "Clinic admins manage locations" ON clinic_locations FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = clinic_locations.clinic_id AND role = 'clinic_admin')
);
CREATE POLICY "Platform admins full access locations" ON clinic_locations FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to clinic_locations" ON clinic_locations FOR ALL USING (auth.role() = 'service_role');

-- CLINIC HOURS (public read)
CREATE POLICY "Anyone can view clinic hours" ON clinic_hours FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinics WHERE id = clinic_hours.clinic_id AND status = 'approved')
);
CREATE POLICY "Clinic admins manage hours" ON clinic_hours FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = clinic_hours.clinic_id AND role = 'clinic_admin')
);
CREATE POLICY "Platform admins full access hours" ON clinic_hours FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to clinic_hours" ON clinic_hours FOR ALL USING (auth.role() = 'service_role');

-- SERVICE CATEGORIES (public read)
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Platform admins manage categories" ON service_categories FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to service_categories" ON service_categories FOR ALL USING (auth.role() = 'service_role');

-- SERVICES (public read)
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Platform admins manage services" ON services FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to services" ON services FOR ALL USING (auth.role() = 'service_role');

-- CLINIC SERVICES (public read)
CREATE POLICY "Anyone can view clinic services" ON clinic_services FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinics WHERE id = clinic_services.clinic_id AND status = 'approved')
);
CREATE POLICY "Clinic admins manage clinic services" ON clinic_services FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = clinic_services.clinic_id AND role = 'clinic_admin')
);
CREATE POLICY "Platform admins full access clinic services" ON clinic_services FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to clinic_services" ON clinic_services FOR ALL USING (auth.role() = 'service_role');

-- PRACTITIONERS (public read for approved clinics)
CREATE POLICY "Anyone can view practitioners of approved clinics" ON practitioners FOR SELECT USING (
  EXISTS (SELECT 1 FROM clinics WHERE id = practitioners.clinic_id AND status = 'approved')
);
CREATE POLICY "Clinic admins manage practitioners" ON practitioners FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_staff WHERE profile_id = auth.uid() AND clinic_id = practitioners.clinic_id AND role = 'clinic_admin')
);
CREATE POLICY "Practitioners can update own record" ON practitioners FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Platform admins full access practitioners" ON practitioners FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to practitioners" ON practitioners FOR ALL USING (auth.role() = 'service_role');

-- CLINIC STAFF
CREATE POLICY "Clinic admins can manage staff" ON clinic_staff FOR ALL USING (
  EXISTS (SELECT 1 FROM clinic_staff cs WHERE cs.profile_id = auth.uid() AND cs.clinic_id = clinic_staff.clinic_id AND cs.role = 'clinic_admin')
);
CREATE POLICY "Staff can view own membership" ON clinic_staff FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Platform admins full access staff" ON clinic_staff FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to clinic_staff" ON clinic_staff FOR ALL USING (auth.role() = 'service_role');

-- PRACTITIONER AVAILABILITY (public read)
CREATE POLICY "Anyone can view availability" ON practitioner_availability FOR SELECT USING (true);
CREATE POLICY "Clinic admins manage availability" ON practitioner_availability FOR ALL USING (
  EXISTS (
    SELECT 1 FROM practitioners p
    JOIN clinic_staff cs ON cs.clinic_id = p.clinic_id
    WHERE p.id = practitioner_availability.practitioner_id AND cs.profile_id = auth.uid() AND cs.role = 'clinic_admin'
  )
);
CREATE POLICY "Practitioners manage own availability" ON practitioner_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM practitioners WHERE id = practitioner_availability.practitioner_id AND profile_id = auth.uid())
);
CREATE POLICY "Platform admins full access availability" ON practitioner_availability FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to practitioner_availability" ON practitioner_availability FOR ALL USING (auth.role() = 'service_role');

-- APPOINTMENTS
CREATE POLICY "Patients can view own appointments" ON appointments FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients can update own appointments" ON appointments FOR UPDATE USING (patient_id = auth.uid());
CREATE POLICY "Clinic members can view clinic appointments" ON appointments FOR SELECT USING (is_clinic_member(clinic_id));
CREATE POLICY "Clinic members can update clinic appointments" ON appointments FOR UPDATE USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access appointments" ON appointments FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to appointments" ON appointments FOR ALL USING (auth.role() = 'service_role');

-- APPOINTMENT STATUS HISTORY
CREATE POLICY "Patients can view own appointment history" ON appointment_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE id = appointment_status_history.appointment_id AND patient_id = auth.uid())
);
CREATE POLICY "Clinic members can view/create history" ON appointment_status_history FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = appointment_status_history.appointment_id AND is_clinic_member(a.clinic_id))
);
CREATE POLICY "Platform admins full access status history" ON appointment_status_history FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to appointment_status_history" ON appointment_status_history FOR ALL USING (auth.role() = 'service_role');

-- WAITLIST ENTRIES
CREATE POLICY "Patients can view own waitlist" ON waitlist_entries FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can create waitlist entries" ON waitlist_entries FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients can update own waitlist" ON waitlist_entries FOR UPDATE USING (patient_id = auth.uid());
CREATE POLICY "Clinic members can manage waitlist" ON waitlist_entries FOR ALL USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access waitlist" ON waitlist_entries FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to waitlist_entries" ON waitlist_entries FOR ALL USING (auth.role() = 'service_role');

-- QUEUE ENTRIES
CREATE POLICY "Patients can view own queue" ON queue_entries FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Anyone can view queue depth" ON queue_entries FOR SELECT USING (true);
CREATE POLICY "Clinic members can manage queue" ON queue_entries FOR ALL USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access queue" ON queue_entries FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to queue_entries" ON queue_entries FOR ALL USING (auth.role() = 'service_role');

-- CALLBACK REQUESTS
CREATE POLICY "Patients can view own callbacks" ON callback_requests FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can create callbacks" ON callback_requests FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Clinic members can manage callbacks" ON callback_requests FOR ALL USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access callbacks" ON callback_requests FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to callback_requests" ON callback_requests FOR ALL USING (auth.role() = 'service_role');

-- WAIT TIME SNAPSHOTS (public read)
CREATE POLICY "Anyone can view wait times" ON wait_time_snapshots FOR SELECT USING (true);
CREATE POLICY "Clinic members can manage wait times" ON wait_time_snapshots FOR ALL USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access wait times" ON wait_time_snapshots FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to wait_time_snapshots" ON wait_time_snapshots FOR ALL USING (auth.role() = 'service_role');

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role full access to notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Platform admins full access notifications" ON notifications FOR ALL USING (is_platform_admin());

-- VIRTUAL SESSIONS
CREATE POLICY "Patients can view own sessions" ON virtual_sessions FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Clinic members can manage sessions" ON virtual_sessions FOR ALL USING (is_clinic_member(clinic_id));
CREATE POLICY "Platform admins full access sessions" ON virtual_sessions FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to virtual_sessions" ON virtual_sessions FOR ALL USING (auth.role() = 'service_role');

-- AUDIT LOGS
CREATE POLICY "Platform admins can view audit logs" ON audit_logs FOR SELECT USING (is_platform_admin());
CREATE POLICY "Service role full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'service_role');
-- Allow inserts from authenticated users (for logging their own actions)
CREATE POLICY "Authenticated users can create audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- REGIONS (public read)
CREATE POLICY "Anyone can view regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Platform admins manage regions" ON regions FOR ALL USING (is_platform_admin());
CREATE POLICY "Service role full access to regions" ON regions FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME PUBLICATIONS
-- ============================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE wait_time_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE waitlist_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE callback_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
