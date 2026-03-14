-- ============================================
-- MyHealthMap Seed Data
-- ============================================
-- NOTE: Before running this seed, you must create auth users via the Supabase Auth API.
-- Use the companion script (scripts/seed-auth-users.ts) or create them manually.
-- The UUIDs below must match the auth users created.

-- Fixed UUIDs for demo users (these must match auth.users entries)
-- patient@example.com         -> 00000000-0000-0000-0000-000000000001
-- staff@downtownclinic.com    -> 00000000-0000-0000-0000-000000000002
-- doctor@downtownclinic.com   -> 00000000-0000-0000-0000-000000000003
-- admin@downtownclinic.com    -> 00000000-0000-0000-0000-000000000004
-- platformadmin@example.com   -> 00000000-0000-0000-0000-000000000005
-- patient2@example.com        -> 00000000-0000-0000-0000-000000000006
-- patient3@example.com        -> 00000000-0000-0000-0000-000000000007
-- doctor2@maplemedical.com    -> 00000000-0000-0000-0000-000000000008
-- doctor3@urgentcare.com      -> 00000000-0000-0000-0000-000000000009
-- staff@maplemedical.com      -> 00000000-0000-0000-0000-000000000010
-- admin@maplemedical.com      -> 00000000-0000-0000-0000-000000000011
-- doctor4@virtualcare.com     -> 00000000-0000-0000-0000-000000000012

-- ============================================
-- PROFILES
-- ============================================
INSERT INTO profiles (id, email, full_name, phone, role, city, province, postal_code) VALUES
('00000000-0000-0000-0000-000000000001', 'patient@example.com', 'Sarah Johnson', '(416) 555-0101', 'patient', 'Toronto', 'ON', 'M5V 2T6'),
('00000000-0000-0000-0000-000000000002', 'staff@downtownclinic.com', 'Emily Chen', '(416) 555-0102', 'clinic_staff', 'Toronto', 'ON', 'M5V 2T6'),
('00000000-0000-0000-0000-000000000003', 'doctor@downtownclinic.com', 'Dr. Michael Roberts', '(416) 555-0103', 'practitioner', 'Toronto', 'ON', 'M5V 2T6'),
('00000000-0000-0000-0000-000000000004', 'admin@downtownclinic.com', 'James Wilson', '(416) 555-0104', 'clinic_admin', 'Toronto', 'ON', 'M5V 2T6'),
('00000000-0000-0000-0000-000000000005', 'platformadmin@example.com', 'Platform Admin', '(416) 555-0100', 'platform_admin', 'Toronto', 'ON', 'M5V 1A1'),
('00000000-0000-0000-0000-000000000006', 'patient2@example.com', 'David Kim', '(604) 555-0201', 'patient', 'Vancouver', 'BC', 'V6B 1A1'),
('00000000-0000-0000-0000-000000000007', 'patient3@example.com', 'Lisa Martinez', '(403) 555-0301', 'patient', 'Calgary', 'AB', 'T2P 1J9'),
('00000000-0000-0000-0000-000000000008', 'doctor2@maplemedical.com', 'Dr. Priya Sharma', '(416) 555-0201', 'practitioner', 'Toronto', 'ON', 'M4W 1A8'),
('00000000-0000-0000-0000-000000000009', 'doctor3@urgentcare.com', 'Dr. Robert Lee', '(604) 555-0301', 'practitioner', 'Vancouver', 'BC', 'V6Z 1L2'),
('00000000-0000-0000-0000-000000000010', 'staff@maplemedical.com', 'Amanda Torres', '(416) 555-0202', 'clinic_staff', 'Toronto', 'ON', 'M4W 1A8'),
('00000000-0000-0000-0000-000000000011', 'admin@maplemedical.com', 'Chris Anderson', '(416) 555-0203', 'clinic_admin', 'Toronto', 'ON', 'M4W 1A8'),
('00000000-0000-0000-0000-000000000012', 'doctor4@virtualcare.com', 'Dr. Jennifer Wu', '(416) 555-0401', 'practitioner', 'Toronto', 'ON', 'M5H 2N2');

-- ============================================
-- REGIONS
-- ============================================
INSERT INTO regions (id, name, province) VALUES
('a0000000-0000-0000-0000-000000000001', 'Greater Toronto Area', 'ON'),
('a0000000-0000-0000-0000-000000000002', 'Metro Vancouver', 'BC'),
('a0000000-0000-0000-0000-000000000003', 'Calgary Region', 'AB'),
('a0000000-0000-0000-0000-000000000004', 'Ottawa-Gatineau', 'ON'),
('a0000000-0000-0000-0000-000000000005', 'Montreal Region', 'QC'),
('a0000000-0000-0000-0000-000000000006', 'Edmonton Region', 'AB');

-- ============================================
-- SERVICE CATEGORIES
-- ============================================
INSERT INTO service_categories (id, name, description, icon) VALUES
('b0000000-0000-0000-0000-000000000001', 'Primary Care', 'General health services and check-ups', 'heart'),
('b0000000-0000-0000-0000-000000000002', 'Urgent Care', 'Non-emergency urgent medical services', 'alert-circle'),
('b0000000-0000-0000-0000-000000000003', 'Mental Health', 'Counseling and mental health services', 'brain'),
('b0000000-0000-0000-0000-000000000004', 'Pediatrics', 'Healthcare for children and adolescents', 'baby'),
('b0000000-0000-0000-0000-000000000005', 'Womens Health', 'Gynecology and womens health services', 'heart'),
('b0000000-0000-0000-0000-000000000006', 'Preventive Care', 'Vaccinations and preventive screenings', 'shield');

-- ============================================
-- SERVICES
-- ============================================
INSERT INTO services (id, name, description, category_id, default_duration) VALUES
('c0000000-0000-0000-0000-000000000001', 'General Check-up', 'Routine health examination', 'b0000000-0000-0000-0000-000000000001', 20),
('c0000000-0000-0000-0000-000000000002', 'Walk-in Consultation', 'Drop-in medical consultation', 'b0000000-0000-0000-0000-000000000001', 15),
('c0000000-0000-0000-0000-000000000003', 'Flu Shot', 'Annual influenza vaccination', 'b0000000-0000-0000-0000-000000000006', 10),
('c0000000-0000-0000-0000-000000000004', 'Blood Work', 'Blood test and lab work', 'b0000000-0000-0000-0000-000000000001', 15),
('c0000000-0000-0000-0000-000000000005', 'Prescription Renewal', 'Renew existing prescription', 'b0000000-0000-0000-0000-000000000001', 10),
('c0000000-0000-0000-0000-000000000006', 'Minor Injury Treatment', 'Cuts, sprains, and minor injuries', 'b0000000-0000-0000-0000-000000000002', 20),
('c0000000-0000-0000-0000-000000000007', 'Skin Condition', 'Rashes, acne, and skin concerns', 'b0000000-0000-0000-0000-000000000001', 15),
('c0000000-0000-0000-0000-000000000008', 'Mental Health Consultation', 'Initial mental health assessment', 'b0000000-0000-0000-0000-000000000003', 30),
('c0000000-0000-0000-0000-000000000009', 'Physical Exam', 'Comprehensive physical examination', 'b0000000-0000-0000-0000-000000000001', 30),
('c0000000-0000-0000-0000-000000000010', 'Virtual Consultation', 'Remote video consultation', 'b0000000-0000-0000-0000-000000000001', 15),
('c0000000-0000-0000-0000-000000000011', 'Pediatric Check-up', 'Child health examination', 'b0000000-0000-0000-0000-000000000004', 20),
('c0000000-0000-0000-0000-000000000012', 'COVID-19 Assessment', 'COVID-19 symptom assessment and testing', 'b0000000-0000-0000-0000-000000000002', 15),
('c0000000-0000-0000-0000-000000000013', 'Travel Health Consultation', 'Travel vaccinations and advice', 'b0000000-0000-0000-0000-000000000006', 20),
('c0000000-0000-0000-0000-000000000014', 'Allergy Assessment', 'Allergy testing and management', 'b0000000-0000-0000-0000-000000000001', 25),
('c0000000-0000-0000-0000-000000000015', 'Womens Health Exam', 'Annual gynecological examination', 'b0000000-0000-0000-0000-000000000005', 30);

-- ============================================
-- CLINICS (16 clinics across multiple cities)
-- ============================================
INSERT INTO clinics (id, name, slug, description, phone, email, website, status, is_walk_in, is_virtual, is_appointment_only, average_consult_duration, created_by) VALUES
('d0000000-0000-0000-0000-000000000001', 'Downtown Walk-in Clinic', 'downtown-walk-in-clinic', 'Friendly walk-in clinic in the heart of downtown Toronto. No appointment needed. Open 7 days a week with extended hours.', '(416) 555-1001', 'info@downtownclinic.com', 'https://downtownclinic.example.com', 'approved', true, true, false, 15, '00000000-0000-0000-0000-000000000004'),
('d0000000-0000-0000-0000-000000000002', 'Maple Medical Centre', 'maple-medical-centre', 'Full-service family medical centre offering comprehensive primary care. Accepting new patients with referrals.', '(416) 555-2001', 'info@maplemedical.com', 'https://maplemedical.example.com', 'approved', true, true, false, 20, '00000000-0000-0000-0000-000000000011'),
('d0000000-0000-0000-0000-000000000003', 'Pacific Urgent Care', 'pacific-urgent-care', 'Vancouver urgent care clinic for non-emergency medical needs. Quick and efficient care when you need it.', '(604) 555-3001', 'info@pacificurgentcare.com', NULL, 'approved', true, false, false, 12, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000004', 'VirtualCare Plus', 'virtualcare-plus', 'Online healthcare from the comfort of your home. Connect with doctors via secure video consultation.', '(416) 555-4001', 'info@virtualcareplus.com', 'https://virtualcareplus.example.com', 'approved', false, true, true, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000005', 'Calgary Family Health', 'calgary-family-health', 'Trusted family practice serving Calgary families for over 15 years. Comprehensive care for all ages.', '(403) 555-5001', 'info@calgaryfamily.com', NULL, 'approved', true, false, false, 20, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000006', 'Yonge Street Medical', 'yonge-street-medical', 'Conveniently located on Yonge Street with easy TTC access. Walk-ins and appointments welcome.', '(416) 555-6001', 'info@yongemedical.com', NULL, 'approved', true, true, false, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000007', 'Kitsilano Health Clinic', 'kitsilano-health-clinic', 'Community health clinic in the Kitsilano neighborhood. Offering primary care and wellness services.', '(604) 555-7001', 'info@kitshealth.com', NULL, 'approved', true, false, false, 18, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000008', 'Scarborough Medical Group', 'scarborough-medical-group', 'Multi-physician practice serving the Scarborough community. Same-day appointments available.', '(416) 555-8001', 'info@scarboroughmed.com', NULL, 'approved', true, true, false, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000009', 'Ottawa Care Centre', 'ottawa-care-centre', 'Bilingual healthcare services in the Nations capital. Serving the Ottawa-Gatineau community.', '(613) 555-9001', 'info@ottawacare.com', NULL, 'approved', true, false, false, 20, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000010', 'MediQuick Express Clinic', 'mediquick-express', 'Get in and out fast. Express clinic for minor ailments, prescriptions, and quick consultations.', '(416) 555-1010', 'info@mediquick.com', NULL, 'approved', true, false, false, 10, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000011', 'North York Wellness Centre', 'north-york-wellness', 'Holistic wellness centre combining traditional medicine with preventive care approaches.', '(416) 555-1101', 'info@nywellness.com', NULL, 'approved', true, true, false, 20, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000012', 'Burnaby Medical Clinic', 'burnaby-medical-clinic', 'Established medical clinic serving Burnaby and surrounding areas since 2005.', '(604) 555-1201', 'info@burnabymedical.com', NULL, 'approved', true, false, false, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000013', 'Edmonton Central Clinic', 'edmonton-central-clinic', 'Central Edmonton clinic offering walk-in and booked appointments.', '(780) 555-1301', 'info@edmontoncentral.com', NULL, 'approved', true, false, false, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000014', 'Montreal Clinique Sante', 'montreal-clinique-sante', 'Bilingual healthcare clinic in downtown Montreal providing quality primary care.', '(514) 555-1401', 'info@cliniquesante.com', NULL, 'approved', true, true, false, 15, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000015', 'Richmond Hill Family Practice', 'richmond-hill-family', 'Family-oriented practice in Richmond Hill. New patients welcome.', '(905) 555-1501', 'info@rhfamily.com', NULL, 'approved', false, false, true, 25, '00000000-0000-0000-0000-000000000005'),
('d0000000-0000-0000-0000-000000000016', 'Pending Medical Clinic', 'pending-medical-clinic', 'This clinic is awaiting admin approval.', '(416) 555-9999', 'info@pendingclinic.com', NULL, 'pending', true, false, false, 15, '00000000-0000-0000-0000-000000000005');

-- ============================================
-- CLINIC LOCATIONS
-- ============================================
INSERT INTO clinic_locations (clinic_id, address, city, province, postal_code, latitude, longitude, region_id, is_primary) VALUES
('d0000000-0000-0000-0000-000000000001', '100 King Street West', 'Toronto', 'ON', 'M5X 1A9', 43.6488, -79.3834, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000002', '250 Bloor Street East', 'Toronto', 'ON', 'M4W 1E6', 43.6709, -79.3797, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000003', '888 West Broadway', 'Vancouver', 'BC', 'V5Z 1J8', 49.2634, -123.1139, 'a0000000-0000-0000-0000-000000000002', true),
('d0000000-0000-0000-0000-000000000004', '200 University Avenue', 'Toronto', 'ON', 'M5H 3C6', 43.6511, -79.3845, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000005', '500 Centre Street SE', 'Calgary', 'AB', 'T2G 1A6', 51.0447, -114.0619, 'a0000000-0000-0000-0000-000000000003', true),
('d0000000-0000-0000-0000-000000000006', '2300 Yonge Street', 'Toronto', 'ON', 'M4P 1E4', 43.7054, -79.3981, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000007', '2155 West 4th Avenue', 'Vancouver', 'BC', 'V6K 1N7', 49.2685, -123.1597, 'a0000000-0000-0000-0000-000000000002', true),
('d0000000-0000-0000-0000-000000000008', '3030 Lawrence Avenue East', 'Scarborough', 'ON', 'M1P 2T7', 43.7615, -79.2317, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000009', '200 Kent Street', 'Ottawa', 'ON', 'K2P 0B6', 45.4215, -75.6972, 'a0000000-0000-0000-0000-000000000004', true),
('d0000000-0000-0000-0000-000000000010', '55 Eglinton Avenue East', 'Toronto', 'ON', 'M4P 1G8', 43.7066, -79.3987, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000011', '5000 Yonge Street', 'North York', 'ON', 'M2N 7E9', 43.7676, -79.4128, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000012', '4500 Kingsway', 'Burnaby', 'BC', 'V5H 2A9', 49.2276, -123.0076, 'a0000000-0000-0000-0000-000000000002', true),
('d0000000-0000-0000-0000-000000000013', '10123 99 Street NW', 'Edmonton', 'AB', 'T5J 3H1', 53.5461, -113.4938, 'a0000000-0000-0000-0000-000000000006', true),
('d0000000-0000-0000-0000-000000000014', '1250 Rue Guy', 'Montreal', 'QC', 'H3H 2L3', 45.4912, -73.5765, 'a0000000-0000-0000-0000-000000000005', true),
('d0000000-0000-0000-0000-000000000015', '9325 Yonge Street', 'Richmond Hill', 'ON', 'L4C 0A8', 43.8723, -79.4373, 'a0000000-0000-0000-0000-000000000001', true),
('d0000000-0000-0000-0000-000000000016', '123 Pending Lane', 'Toronto', 'ON', 'M5V 0A0', 43.6426, -79.3871, 'a0000000-0000-0000-0000-000000000001', true);

-- ============================================
-- CLINIC HOURS (for first 6 clinics - others similar)
-- ============================================
-- Downtown Walk-in Clinic (open 7 days)
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000001', 'monday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000001', 'tuesday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000001', 'wednesday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000001', 'thursday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000001', 'friday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000001', 'saturday', '09:00', '17:00', false),
('d0000000-0000-0000-0000-000000000001', 'sunday', '10:00', '16:00', false);

-- Maple Medical Centre
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000002', 'monday', '08:30', '18:00', false),
('d0000000-0000-0000-0000-000000000002', 'tuesday', '08:30', '18:00', false),
('d0000000-0000-0000-0000-000000000002', 'wednesday', '08:30', '18:00', false),
('d0000000-0000-0000-0000-000000000002', 'thursday', '08:30', '18:00', false),
('d0000000-0000-0000-0000-000000000002', 'friday', '08:30', '17:00', false),
('d0000000-0000-0000-0000-000000000002', 'saturday', '09:00', '14:00', false),
('d0000000-0000-0000-0000-000000000002', 'sunday', '00:00', '00:00', true);

-- Pacific Urgent Care
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000003', 'monday', '07:00', '22:00', false),
('d0000000-0000-0000-0000-000000000003', 'tuesday', '07:00', '22:00', false),
('d0000000-0000-0000-0000-000000000003', 'wednesday', '07:00', '22:00', false),
('d0000000-0000-0000-0000-000000000003', 'thursday', '07:00', '22:00', false),
('d0000000-0000-0000-0000-000000000003', 'friday', '07:00', '22:00', false),
('d0000000-0000-0000-0000-000000000003', 'saturday', '08:00', '20:00', false),
('d0000000-0000-0000-0000-000000000003', 'sunday', '09:00', '18:00', false);

-- VirtualCare Plus (extended hours)
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000004', 'monday', '06:00', '23:00', false),
('d0000000-0000-0000-0000-000000000004', 'tuesday', '06:00', '23:00', false),
('d0000000-0000-0000-0000-000000000004', 'wednesday', '06:00', '23:00', false),
('d0000000-0000-0000-0000-000000000004', 'thursday', '06:00', '23:00', false),
('d0000000-0000-0000-0000-000000000004', 'friday', '06:00', '23:00', false),
('d0000000-0000-0000-0000-000000000004', 'saturday', '08:00', '22:00', false),
('d0000000-0000-0000-0000-000000000004', 'sunday', '08:00', '22:00', false);

-- Calgary Family Health
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000005', 'monday', '08:00', '17:00', false),
('d0000000-0000-0000-0000-000000000005', 'tuesday', '08:00', '17:00', false),
('d0000000-0000-0000-0000-000000000005', 'wednesday', '08:00', '17:00', false),
('d0000000-0000-0000-0000-000000000005', 'thursday', '08:00', '19:00', false),
('d0000000-0000-0000-0000-000000000005', 'friday', '08:00', '17:00', false),
('d0000000-0000-0000-0000-000000000005', 'saturday', '09:00', '13:00', false),
('d0000000-0000-0000-0000-000000000005', 'sunday', '00:00', '00:00', true);

-- Yonge Street Medical
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed) VALUES
('d0000000-0000-0000-0000-000000000006', 'monday', '09:00', '19:00', false),
('d0000000-0000-0000-0000-000000000006', 'tuesday', '09:00', '19:00', false),
('d0000000-0000-0000-0000-000000000006', 'wednesday', '09:00', '19:00', false),
('d0000000-0000-0000-0000-000000000006', 'thursday', '09:00', '19:00', false),
('d0000000-0000-0000-0000-000000000006', 'friday', '09:00', '17:00', false),
('d0000000-0000-0000-0000-000000000006', 'saturday', '10:00', '15:00', false),
('d0000000-0000-0000-0000-000000000006', 'sunday', '00:00', '00:00', true);

-- Add hours for remaining clinics (similar patterns)
INSERT INTO clinic_hours (clinic_id, day_of_week, open_time, close_time, is_closed)
SELECT c.id, d.day,
  CASE WHEN d.day IN ('saturday') THEN '09:00' WHEN d.day IN ('sunday') THEN '00:00' ELSE '08:00' END,
  CASE WHEN d.day IN ('saturday') THEN '14:00' WHEN d.day IN ('sunday') THEN '00:00' ELSE '17:30' END,
  CASE WHEN d.day IN ('sunday') THEN true ELSE false END
FROM clinics c
CROSS JOIN (VALUES ('monday'::day_of_week), ('tuesday'), ('wednesday'), ('thursday'), ('friday'), ('saturday'), ('sunday')) AS d(day)
WHERE c.id IN (
  'd0000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000008',
  'd0000000-0000-0000-0000-000000000009',
  'd0000000-0000-0000-0000-000000000010',
  'd0000000-0000-0000-0000-000000000011',
  'd0000000-0000-0000-0000-000000000012',
  'd0000000-0000-0000-0000-000000000013',
  'd0000000-0000-0000-0000-000000000014',
  'd0000000-0000-0000-0000-000000000015'
);

-- ============================================
-- CLINIC STAFF
-- ============================================
INSERT INTO clinic_staff (profile_id, clinic_id, role, is_active) VALUES
('00000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'clinic_staff', true),
('00000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'clinic_admin', true),
('00000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000002', 'clinic_staff', true),
('00000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000002', 'clinic_admin', true);

-- ============================================
-- PRACTITIONERS
-- ============================================
INSERT INTO practitioners (id, profile_id, clinic_id, title, specialty, bio, is_active, is_accepting_patients) VALUES
('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Dr.', 'Family Medicine', 'Board-certified family physician with 12 years of experience. Special interest in preventive care and chronic disease management.', true, true),
('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 'Dr.', 'Internal Medicine', 'Experienced internist specializing in adult medicine. Fluent in English and Hindi.', true, true),
('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000003', 'Dr.', 'Emergency Medicine', 'Emergency medicine specialist with 8 years in urgent care settings.', true, true),
('e0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000004', 'Dr.', 'General Practice', 'Virtual care specialist focusing on accessible healthcare. Experienced in telemedicine.', true, true);

-- ============================================
-- PRACTITIONER AVAILABILITY
-- ============================================
INSERT INTO practitioner_availability (practitioner_id, day_of_week, start_time, end_time, is_available) VALUES
-- Dr. Roberts (Downtown)
('e0000000-0000-0000-0000-000000000001', 'monday', '08:00', '16:00', true),
('e0000000-0000-0000-0000-000000000001', 'tuesday', '08:00', '16:00', true),
('e0000000-0000-0000-0000-000000000001', 'wednesday', '10:00', '18:00', true),
('e0000000-0000-0000-0000-000000000001', 'thursday', '08:00', '16:00', true),
('e0000000-0000-0000-0000-000000000001', 'friday', '08:00', '14:00', true),
-- Dr. Sharma (Maple)
('e0000000-0000-0000-0000-000000000002', 'monday', '09:00', '17:00', true),
('e0000000-0000-0000-0000-000000000002', 'tuesday', '09:00', '17:00', true),
('e0000000-0000-0000-0000-000000000002', 'wednesday', '09:00', '17:00', true),
('e0000000-0000-0000-0000-000000000002', 'thursday', '09:00', '17:00', true),
('e0000000-0000-0000-0000-000000000002', 'friday', '09:00', '15:00', true),
-- Dr. Lee (Pacific)
('e0000000-0000-0000-0000-000000000003', 'monday', '07:00', '15:00', true),
('e0000000-0000-0000-0000-000000000003', 'tuesday', '07:00', '15:00', true),
('e0000000-0000-0000-0000-000000000003', 'wednesday', '12:00', '20:00', true),
('e0000000-0000-0000-0000-000000000003', 'thursday', '07:00', '15:00', true),
('e0000000-0000-0000-0000-000000000003', 'friday', '07:00', '15:00', true),
-- Dr. Wu (Virtual)
('e0000000-0000-0000-0000-000000000004', 'monday', '08:00', '20:00', true),
('e0000000-0000-0000-0000-000000000004', 'tuesday', '08:00', '20:00', true),
('e0000000-0000-0000-0000-000000000004', 'wednesday', '08:00', '20:00', true),
('e0000000-0000-0000-0000-000000000004', 'thursday', '08:00', '20:00', true),
('e0000000-0000-0000-0000-000000000004', 'friday', '08:00', '18:00', true);

-- ============================================
-- CLINIC SERVICES (map services to clinics)
-- ============================================
INSERT INTO clinic_services (clinic_id, service_id, price, duration_override, is_available) VALUES
-- Downtown Walk-in
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', NULL, 10, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', NULL, NULL, true),
-- Maple Medical
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000009', NULL, 30, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000014', NULL, NULL, true),
-- Pacific Urgent Care
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', NULL, 10, true),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000012', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', NULL, NULL, true),
-- VirtualCare Plus
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000010', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', NULL, NULL, true),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', NULL, NULL, true);

-- ============================================
-- WAIT TIME SNAPSHOTS (recent data for all approved clinics)
-- ============================================
INSERT INTO wait_time_snapshots (clinic_id, estimated_wait_minutes, queue_depth, active_practitioners, is_manual_override, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 25, 4, 1, false, NOW() - INTERVAL '5 minutes'),
('d0000000-0000-0000-0000-000000000002', 15, 2, 2, false, NOW() - INTERVAL '3 minutes'),
('d0000000-0000-0000-0000-000000000003', 45, 8, 1, false, NOW() - INTERVAL '8 minutes'),
('d0000000-0000-0000-0000-000000000004', 5, 1, 1, false, NOW() - INTERVAL '2 minutes'),
('d0000000-0000-0000-0000-000000000005', 30, 3, 1, false, NOW() - INTERVAL '10 minutes'),
('d0000000-0000-0000-0000-000000000006', 20, 3, 1, false, NOW() - INTERVAL '7 minutes'),
('d0000000-0000-0000-0000-000000000007', 10, 1, 1, false, NOW() - INTERVAL '4 minutes'),
('d0000000-0000-0000-0000-000000000008', 35, 5, 2, false, NOW() - INTERVAL '6 minutes'),
('d0000000-0000-0000-0000-000000000009', 40, 6, 1, false, NOW() - INTERVAL '12 minutes'),
('d0000000-0000-0000-0000-000000000010', 5, 0, 1, false, NOW() - INTERVAL '1 minute'),
('d0000000-0000-0000-0000-000000000011', 20, 3, 1, false, NOW() - INTERVAL '9 minutes'),
('d0000000-0000-0000-0000-000000000012', 15, 2, 1, false, NOW() - INTERVAL '5 minutes'),
('d0000000-0000-0000-0000-000000000013', 25, 4, 1, false, NOW() - INTERVAL '11 minutes'),
('d0000000-0000-0000-0000-000000000014', 30, 5, 1, false, NOW() - INTERVAL '7 minutes'),
('d0000000-0000-0000-0000-000000000015', 0, 0, 1, false, NOW() - INTERVAL '15 minutes');

-- ============================================
-- APPOINTMENTS (mix of past and future)
-- ============================================
INSERT INTO appointments (id, patient_id, clinic_id, practitioner_id, service_id, appointment_date, start_time, end_time, status, reason, is_virtual) VALUES
-- Upcoming appointments for patient1
('f0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '2 days', '10:00', '10:20', 'scheduled', 'Annual check-up', false),
('f0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000010', CURRENT_DATE + INTERVAL '5 days', '14:00', '14:15', 'scheduled', 'Follow-up consultation', true),
-- Past appointments for patient1
('f0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '14 days', '09:00', '09:10', 'completed', 'Flu shot', false),
('f0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '30 days', '11:00', '11:15', 'completed', 'Blood work results', false),
-- Appointments for patient2
('f0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', CURRENT_DATE + INTERVAL '1 day', '09:30', '09:50', 'scheduled', 'Twisted ankle', false),
('f0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '7 days', '10:00', '10:15', 'completed', 'General consultation', false),
-- Appointments for patient3
('f0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', NULL, 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '3 days', '14:00', '14:20', 'scheduled', 'General check-up', false),
-- Today appointments (for clinic dashboard demo)
('f0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', CURRENT_DATE, '09:00', '09:15', 'completed', 'Walk-in consultation', false),
('f0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', CURRENT_DATE, '10:30', '10:40', 'checked_in', 'Prescription renewal', false),
('f0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE, '11:00', '11:20', 'scheduled', 'Check-up', false),
('f0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', CURRENT_DATE, '13:00', '13:15', 'scheduled', 'Blood work', false),
('f0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', CURRENT_DATE, '14:30', '14:45', 'scheduled', 'Skin concern', false);

-- ============================================
-- QUEUE ENTRIES
-- ============================================
INSERT INTO queue_entries (patient_id, clinic_id, practitioner_id, patient_name, queue_number, status, check_in_time, estimated_wait_minutes) VALUES
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', NULL, 1, 'in_progress', NOW() - INTERVAL '25 minutes', 0),
('00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', NULL, NULL, 2, 'called', NOW() - INTERVAL '20 minutes', 5),
(NULL, 'd0000000-0000-0000-0000-000000000001', NULL, 'Walk-in Patient A', 3, 'waiting', NOW() - INTERVAL '15 minutes', 15),
(NULL, 'd0000000-0000-0000-0000-000000000001', NULL, 'Walk-in Patient B', 4, 'waiting', NOW() - INTERVAL '10 minutes', 25),
('00000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', NULL, 1, 'waiting', NOW() - INTERVAL '30 minutes', 15),
(NULL, 'd0000000-0000-0000-0000-000000000003', NULL, 'Walk-in Patient C', 2, 'waiting', NOW() - INTERVAL '20 minutes', 30);

-- ============================================
-- WAITLIST ENTRIES
-- ============================================
INSERT INTO waitlist_entries (patient_id, clinic_id, practitioner_id, status, position, preferred_date, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'waiting', 1, CURRENT_DATE + INTERVAL '7 days', 'Prefer morning appointment'),
('00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', NULL, 'waiting', 2, CURRENT_DATE + INTERVAL '3 days', 'Any time works'),
('00000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', NULL, 'waiting', 3, NULL, 'Need appointment ASAP'),
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', NULL, 'waiting', 1, CURRENT_DATE + INTERVAL '5 days', NULL);

-- ============================================
-- CALLBACK REQUESTS
-- ============================================
INSERT INTO callback_requests (patient_id, clinic_id, phone, reason, preferred_time, status) VALUES
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '(416) 555-0101', 'Need to discuss test results', 'After 2pm', 'pending'),
('00000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', '(604) 555-0201', 'Question about medication', 'Morning preferred', 'pending'),
('00000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', '(403) 555-0301', 'Scheduling follow-up', 'Any time', 'completed'),
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '(416) 555-0101', 'Referral question', NULL, 'attempted');

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
('00000000-0000-0000-0000-000000000001', 'appointment_reminder', 'Upcoming Appointment', 'You have an appointment at Downtown Walk-in Clinic in 2 days.', false),
('00000000-0000-0000-0000-000000000001', 'waitlist_update', 'Waitlist Update', 'You are now #1 on the waitlist at Maple Medical Centre.', false),
('00000000-0000-0000-0000-000000000001', 'appointment_update', 'Appointment Completed', 'Your flu shot appointment has been marked as completed.', true),
('00000000-0000-0000-0000-000000000006', 'appointment_reminder', 'Upcoming Appointment', 'You have an appointment at Pacific Urgent Care tomorrow.', false),
('00000000-0000-0000-0000-000000000006', 'callback_update', 'Callback Pending', 'Your callback request to Pacific Urgent Care is being processed.', false),
('00000000-0000-0000-0000-000000000007', 'queue_update', 'Queue Update', 'You are currently #1 in the queue at Pacific Urgent Care.', false);

-- ============================================
-- VIRTUAL SESSIONS
-- ============================================
INSERT INTO virtual_sessions (patient_id, practitioner_id, clinic_id, appointment_id, status, room_id) VALUES
('00000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'scheduled', 'room-demo-001');

-- ============================================
-- AUDIT LOGS (sample entries)
-- ============================================
INSERT INTO audit_logs (user_id, action, table_name, record_id) VALUES
('00000000-0000-0000-0000-000000000005', 'clinic_approved', 'clinics', 'd0000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000005', 'clinic_approved', 'clinics', 'd0000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000005', 'clinic_approved', 'clinics', 'd0000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000004', 'practitioner_added', 'practitioners', 'e0000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000004', 'schedule_updated', 'practitioner_availability', NULL),
('00000000-0000-0000-0000-000000000001', 'appointment_booked', 'appointments', 'f0000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000001', 'appointment_booked', 'appointments', 'f0000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000003', 'appointment_completed', 'appointments', 'f0000000-0000-0000-0000-000000000003');
