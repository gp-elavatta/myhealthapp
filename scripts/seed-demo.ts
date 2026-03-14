/**
 * Complete Demo Seed Script
 *
 * Creates auth users and inserts profile data.
 * Run with: npx tsx scripts/seed-demo.ts
 *
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Copy .env.example to .env.local and fill in values.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface DemoUser {
  email: string
  password: string
  full_name: string
  phone: string
  role: string
  city: string
  province: string
  postal_code: string
}

const users: DemoUser[] = [
  { email: 'patient@example.com', password: 'password123', full_name: 'Sarah Johnson', phone: '(416) 555-0101', role: 'patient', city: 'Toronto', province: 'ON', postal_code: 'M5V 2T6' },
  { email: 'staff@downtownclinic.com', password: 'password123', full_name: 'Emily Chen', phone: '(416) 555-0102', role: 'clinic_staff', city: 'Toronto', province: 'ON', postal_code: 'M5V 2T6' },
  { email: 'doctor@downtownclinic.com', password: 'password123', full_name: 'Dr. Michael Roberts', phone: '(416) 555-0103', role: 'practitioner', city: 'Toronto', province: 'ON', postal_code: 'M5V 2T6' },
  { email: 'admin@downtownclinic.com', password: 'password123', full_name: 'James Wilson', phone: '(416) 555-0104', role: 'clinic_admin', city: 'Toronto', province: 'ON', postal_code: 'M5V 2T6' },
  { email: 'platformadmin@example.com', password: 'password123', full_name: 'Platform Admin', phone: '(416) 555-0100', role: 'platform_admin', city: 'Toronto', province: 'ON', postal_code: 'M5V 1A1' },
  { email: 'patient2@example.com', password: 'password123', full_name: 'David Kim', phone: '(604) 555-0201', role: 'patient', city: 'Vancouver', province: 'BC', postal_code: 'V6B 1A1' },
  { email: 'patient3@example.com', password: 'password123', full_name: 'Lisa Martinez', phone: '(403) 555-0301', role: 'patient', city: 'Calgary', province: 'AB', postal_code: 'T2P 1J9' },
  { email: 'doctor2@maplemedical.com', password: 'password123', full_name: 'Dr. Priya Sharma', phone: '(416) 555-0201', role: 'practitioner', city: 'Toronto', province: 'ON', postal_code: 'M4W 1A8' },
  { email: 'doctor3@urgentcare.com', password: 'password123', full_name: 'Dr. Robert Lee', phone: '(604) 555-0301', role: 'practitioner', city: 'Vancouver', province: 'BC', postal_code: 'V6Z 1L2' },
  { email: 'staff@maplemedical.com', password: 'password123', full_name: 'Amanda Torres', phone: '(416) 555-0202', role: 'clinic_staff', city: 'Toronto', province: 'ON', postal_code: 'M4W 1A8' },
  { email: 'admin@maplemedical.com', password: 'password123', full_name: 'Chris Anderson', phone: '(416) 555-0203', role: 'clinic_admin', city: 'Toronto', province: 'ON', postal_code: 'M4W 1A8' },
  { email: 'doctor4@virtualcare.com', password: 'password123', full_name: 'Dr. Jennifer Wu', phone: '(416) 555-0401', role: 'practitioner', city: 'Toronto', province: 'ON', postal_code: 'M5H 2N2' },
]

async function seed() {
  console.log('=== MyHealthMap Demo Seed ===\n')

  // Step 1: Create auth users and profiles
  console.log('Step 1: Creating auth users and profiles...')
  const userIdMap: Record<string, string> = {}

  for (const user of users) {
    // Check if exists
    const { data: listData } = await supabase.auth.admin.listUsers()
    const existing = listData?.users?.find(u => u.email === user.email)

    let userId: string

    if (existing) {
      userId = existing.id
      console.log(`  [SKIP] ${user.email} (exists: ${userId})`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name },
      })
      if (error) {
        console.error(`  [ERROR] ${user.email}: ${error.message}`)
        continue
      }
      userId = data.user!.id
      console.log(`  [OK] ${user.email} -> ${userId}`)
    }

    userIdMap[user.email] = userId

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      city: user.city,
      province: user.province,
      postal_code: user.postal_code,
    })
  }

  // Step 2: Create regions
  console.log('\nStep 2: Creating regions...')
  const regions = [
    { name: 'Greater Toronto Area', province: 'ON' },
    { name: 'Metro Vancouver', province: 'BC' },
    { name: 'Calgary Region', province: 'AB' },
    { name: 'Ottawa-Gatineau', province: 'ON' },
    { name: 'Montreal Region', province: 'QC' },
    { name: 'Edmonton Region', province: 'AB' },
  ]
  const { data: regionData } = await supabase.from('regions').upsert(
    regions.map(r => ({ ...r })),
    { onConflict: 'name' }
  ).select()
  const regionMap: Record<string, string> = {}
  regionData?.forEach(r => { regionMap[r.name] = r.id })
  console.log(`  Created ${regionData?.length || 0} regions`)

  // Step 3: Create service categories
  console.log('\nStep 3: Creating service categories...')
  const categories = [
    { name: 'Primary Care', description: 'General health services' },
    { name: 'Urgent Care', description: 'Non-emergency urgent services' },
    { name: 'Mental Health', description: 'Counseling and mental health' },
    { name: 'Preventive Care', description: 'Vaccinations and screenings' },
  ]
  const { data: catData } = await supabase.from('service_categories').upsert(
    categories, { onConflict: 'name' }
  ).select()
  const catMap: Record<string, string> = {}
  catData?.forEach(c => { catMap[c.name] = c.id })
  console.log(`  Created ${catData?.length || 0} categories`)

  // Step 4: Create services
  console.log('\nStep 4: Creating services...')
  const services = [
    { name: 'General Check-up', description: 'Routine health examination', category_id: catMap['Primary Care'], default_duration: 20 },
    { name: 'Walk-in Consultation', description: 'Drop-in medical consultation', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Flu Shot', description: 'Annual influenza vaccination', category_id: catMap['Preventive Care'], default_duration: 10 },
    { name: 'Blood Work', description: 'Blood test and lab work', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Prescription Renewal', description: 'Renew existing prescription', category_id: catMap['Primary Care'], default_duration: 10 },
    { name: 'Minor Injury Treatment', description: 'Cuts, sprains, minor injuries', category_id: catMap['Urgent Care'], default_duration: 20 },
    { name: 'Skin Condition', description: 'Rashes, acne, skin concerns', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Mental Health Consultation', description: 'Initial mental health assessment', category_id: catMap['Mental Health'], default_duration: 30 },
    { name: 'Virtual Consultation', description: 'Remote video consultation', category_id: catMap['Primary Care'], default_duration: 15 },
  ]
  const { data: svcData } = await supabase.from('services').upsert(services, { onConflict: 'name' }).select()
  const svcMap: Record<string, string> = {}
  svcData?.forEach(s => { svcMap[s.name] = s.id })
  console.log(`  Created ${svcData?.length || 0} services`)

  // Step 5: Create clinics
  console.log('\nStep 5: Creating clinics...')
  const clinicDefs = [
    { name: 'Downtown Walk-in Clinic', slug: 'downtown-walk-in-clinic', description: 'Friendly walk-in clinic in downtown Toronto. Open 7 days.', phone: '(416) 555-1001', email: 'info@downtownclinic.com', status: 'approved' as const, is_walk_in: true, is_virtual: true, is_appointment_only: false, average_consult_duration: 15, created_by: userIdMap['admin@downtownclinic.com'], city: 'Toronto', province: 'ON', postal_code: 'M5X 1A9', address: '100 King Street West', region: 'Greater Toronto Area', lat: 43.6488, lng: -79.3834 },
    { name: 'Maple Medical Centre', slug: 'maple-medical-centre', description: 'Full-service family medical centre. Accepting new patients.', phone: '(416) 555-2001', email: 'info@maplemedical.com', status: 'approved' as const, is_walk_in: true, is_virtual: true, is_appointment_only: false, average_consult_duration: 20, created_by: userIdMap['admin@maplemedical.com'], city: 'Toronto', province: 'ON', postal_code: 'M4W 1E6', address: '250 Bloor Street East', region: 'Greater Toronto Area', lat: 43.6709, lng: -79.3797 },
    { name: 'Pacific Urgent Care', slug: 'pacific-urgent-care', description: 'Vancouver urgent care for non-emergency needs.', phone: '(604) 555-3001', email: 'info@pacificurgentcare.com', status: 'approved' as const, is_walk_in: true, is_virtual: false, is_appointment_only: false, average_consult_duration: 12, created_by: userIdMap['platformadmin@example.com'], city: 'Vancouver', province: 'BC', postal_code: 'V5Z 1J8', address: '888 West Broadway', region: 'Metro Vancouver', lat: 49.2634, lng: -123.1139 },
    { name: 'VirtualCare Plus', slug: 'virtualcare-plus', description: 'Online healthcare from home. Secure video consultations.', phone: '(416) 555-4001', email: 'info@virtualcareplus.com', status: 'approved' as const, is_walk_in: false, is_virtual: true, is_appointment_only: true, average_consult_duration: 15, created_by: userIdMap['platformadmin@example.com'], city: 'Toronto', province: 'ON', postal_code: 'M5H 3C6', address: '200 University Avenue', region: 'Greater Toronto Area', lat: 43.6511, lng: -79.3845 },
    { name: 'Calgary Family Health', slug: 'calgary-family-health', description: 'Trusted family practice serving Calgary for 15+ years.', phone: '(403) 555-5001', email: 'info@calgaryfamily.com', status: 'approved' as const, is_walk_in: true, is_virtual: false, is_appointment_only: false, average_consult_duration: 20, created_by: userIdMap['platformadmin@example.com'], city: 'Calgary', province: 'AB', postal_code: 'T2G 1A6', address: '500 Centre Street SE', region: 'Calgary Region', lat: 51.0447, lng: -114.0619 },
    { name: 'Yonge Street Medical', slug: 'yonge-street-medical', description: 'Walk-ins and appointments welcome. Easy TTC access.', phone: '(416) 555-6001', email: 'info@yongemedical.com', status: 'approved' as const, is_walk_in: true, is_virtual: true, is_appointment_only: false, average_consult_duration: 15, created_by: userIdMap['platformadmin@example.com'], city: 'Toronto', province: 'ON', postal_code: 'M4P 1E4', address: '2300 Yonge Street', region: 'Greater Toronto Area', lat: 43.7054, lng: -79.3981 },
    { name: 'MediQuick Express', slug: 'mediquick-express', description: 'Express clinic for quick consultations and prescriptions.', phone: '(416) 555-1010', email: 'info@mediquick.com', status: 'approved' as const, is_walk_in: true, is_virtual: false, is_appointment_only: false, average_consult_duration: 10, created_by: userIdMap['platformadmin@example.com'], city: 'Toronto', province: 'ON', postal_code: 'M4P 1G8', address: '55 Eglinton Avenue East', region: 'Greater Toronto Area', lat: 43.7066, lng: -79.3987 },
    { name: 'Ottawa Care Centre', slug: 'ottawa-care-centre', description: 'Bilingual healthcare in the Nations capital.', phone: '(613) 555-9001', email: 'info@ottawacare.com', status: 'approved' as const, is_walk_in: true, is_virtual: false, is_appointment_only: false, average_consult_duration: 20, created_by: userIdMap['platformadmin@example.com'], city: 'Ottawa', province: 'ON', postal_code: 'K2P 0B6', address: '200 Kent Street', region: 'Ottawa-Gatineau', lat: 45.4215, lng: -75.6972 },
  ]

  const clinicIds: Record<string, string> = {}
  for (const def of clinicDefs) {
    const { city, province, postal_code, address, region, lat, lng, ...clinicData } = def
    const { data: clinic, error } = await supabase.from('clinics').upsert(
      clinicData, { onConflict: 'slug' }
    ).select().single()

    if (error) {
      console.error(`  [ERROR] ${def.name}: ${error.message}`)
      continue
    }
    clinicIds[def.slug] = clinic.id
    console.log(`  [OK] ${def.name} -> ${clinic.id}`)

    // Create location
    await supabase.from('clinic_locations').upsert({
      clinic_id: clinic.id,
      address,
      city,
      province,
      postal_code,
      latitude: lat,
      longitude: lng,
      region_id: regionMap[region] || null,
      is_primary: true,
    }, { onConflict: 'id' })

    // Create hours
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
    for (const day of days) {
      const isSunday = day === 'sunday'
      const isSaturday = day === 'saturday'
      await supabase.from('clinic_hours').upsert({
        clinic_id: clinic.id,
        day_of_week: day,
        open_time: isSunday ? '00:00' : isSaturday ? '09:00' : '08:00',
        close_time: isSunday ? '00:00' : isSaturday ? '14:00' : '18:00',
        is_closed: isSunday,
      }, { onConflict: 'clinic_id,day_of_week' })
    }
  }

  // Step 6: Clinic staff
  console.log('\nStep 6: Creating clinic staff...')
  const staffEntries = [
    { profile_id: userIdMap['staff@downtownclinic.com'], clinic_id: clinicIds['downtown-walk-in-clinic'], role: 'clinic_staff' },
    { profile_id: userIdMap['admin@downtownclinic.com'], clinic_id: clinicIds['downtown-walk-in-clinic'], role: 'clinic_admin' },
    { profile_id: userIdMap['staff@maplemedical.com'], clinic_id: clinicIds['maple-medical-centre'], role: 'clinic_staff' },
    { profile_id: userIdMap['admin@maplemedical.com'], clinic_id: clinicIds['maple-medical-centre'], role: 'clinic_admin' },
  ]
  for (const s of staffEntries) {
    if (s.profile_id && s.clinic_id) {
      await supabase.from('clinic_staff').upsert(s, { onConflict: 'profile_id,clinic_id' })
    }
  }
  console.log(`  Created ${staffEntries.length} staff entries`)

  // Step 7: Practitioners
  console.log('\nStep 7: Creating practitioners...')
  const practDefs = [
    { profile_id: userIdMap['doctor@downtownclinic.com'], clinic_id: clinicIds['downtown-walk-in-clinic'], title: 'Dr.', specialty: 'Family Medicine', bio: 'Board-certified family physician with 12 years of experience.' },
    { profile_id: userIdMap['doctor2@maplemedical.com'], clinic_id: clinicIds['maple-medical-centre'], title: 'Dr.', specialty: 'Internal Medicine', bio: 'Experienced internist specializing in adult medicine.' },
    { profile_id: userIdMap['doctor3@urgentcare.com'], clinic_id: clinicIds['pacific-urgent-care'], title: 'Dr.', specialty: 'Emergency Medicine', bio: 'Emergency medicine specialist with 8 years in urgent care.' },
    { profile_id: userIdMap['doctor4@virtualcare.com'], clinic_id: clinicIds['virtualcare-plus'], title: 'Dr.', specialty: 'General Practice', bio: 'Virtual care specialist focusing on accessible healthcare.' },
  ]
  const practIds: Record<string, string> = {}
  for (const p of practDefs) {
    if (!p.profile_id || !p.clinic_id) continue
    const { data } = await supabase.from('practitioners').upsert({
      ...p,
      is_active: true,
      is_accepting_patients: true,
    }).select().single()
    if (data) {
      practIds[p.profile_id] = data.id
      console.log(`  [OK] ${p.title} (${p.specialty})`)
    }
  }

  // Step 8: Clinic services
  console.log('\nStep 8: Assigning services to clinics...')
  const clinicSvcMappings = [
    { clinic: 'downtown-walk-in-clinic', services: ['General Check-up', 'Walk-in Consultation', 'Flu Shot', 'Blood Work', 'Prescription Renewal', 'Virtual Consultation'] },
    { clinic: 'maple-medical-centre', services: ['General Check-up', 'Blood Work', 'Prescription Renewal', 'Skin Condition', 'Mental Health Consultation'] },
    { clinic: 'pacific-urgent-care', services: ['Walk-in Consultation', 'Minor Injury Treatment', 'Blood Work'] },
    { clinic: 'virtualcare-plus', services: ['Virtual Consultation', 'Prescription Renewal', 'Mental Health Consultation'] },
    { clinic: 'calgary-family-health', services: ['General Check-up', 'Walk-in Consultation', 'Flu Shot'] },
  ]
  for (const mapping of clinicSvcMappings) {
    const cId = clinicIds[mapping.clinic]
    if (!cId) continue
    for (const svcName of mapping.services) {
      const sId = svcMap[svcName]
      if (!sId) continue
      await supabase.from('clinic_services').upsert({
        clinic_id: cId,
        service_id: sId,
        is_available: true,
      }, { onConflict: 'clinic_id,service_id' })
    }
  }
  console.log('  Services assigned')

  // Step 9: Wait time snapshots
  console.log('\nStep 9: Creating wait time snapshots...')
  const waitTimes = [
    { clinic: 'downtown-walk-in-clinic', wait: 25, queue: 4, practitioners: 1 },
    { clinic: 'maple-medical-centre', wait: 15, queue: 2, practitioners: 1 },
    { clinic: 'pacific-urgent-care', wait: 45, queue: 8, practitioners: 1 },
    { clinic: 'virtualcare-plus', wait: 5, queue: 1, practitioners: 1 },
    { clinic: 'calgary-family-health', wait: 30, queue: 3, practitioners: 1 },
    { clinic: 'yonge-street-medical', wait: 20, queue: 3, practitioners: 1 },
    { clinic: 'mediquick-express', wait: 5, queue: 0, practitioners: 1 },
    { clinic: 'ottawa-care-centre', wait: 40, queue: 6, practitioners: 1 },
  ]
  for (const wt of waitTimes) {
    const cId = clinicIds[wt.clinic]
    if (!cId) continue
    await supabase.from('wait_time_snapshots').insert({
      clinic_id: cId,
      estimated_wait_minutes: wt.wait,
      queue_depth: wt.queue,
      active_practitioners: wt.practitioners,
      is_manual_override: false,
    })
  }
  console.log('  Wait times created')

  // Step 10: Sample appointments
  console.log('\nStep 10: Creating sample appointments...')
  const patientId = userIdMap['patient@example.com']
  const doctorPractId = practIds[userIdMap['doctor@downtownclinic.com']]
  const downtownId = clinicIds['downtown-walk-in-clinic']

  if (patientId && doctorPractId && downtownId) {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
    const pastDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]

    await supabase.from('appointments').insert([
      { patient_id: patientId, clinic_id: downtownId, practitioner_id: doctorPractId, service_id: svcMap['General Check-up'], appointment_date: futureDate, start_time: '10:00', end_time: '10:20', status: 'scheduled', reason: 'Annual check-up' },
      { patient_id: patientId, clinic_id: downtownId, practitioner_id: doctorPractId, service_id: svcMap['Flu Shot'], appointment_date: pastDate, start_time: '09:00', end_time: '09:10', status: 'completed', reason: 'Flu shot' },
      { patient_id: patientId, clinic_id: downtownId, practitioner_id: doctorPractId, service_id: svcMap['Walk-in Consultation'], appointment_date: today, start_time: '09:00', end_time: '09:15', status: 'completed', reason: 'Walk-in' },
      { patient_id: patientId, clinic_id: downtownId, practitioner_id: doctorPractId, service_id: svcMap['Blood Work'], appointment_date: today, start_time: '13:00', end_time: '13:15', status: 'scheduled', reason: 'Blood work' },
    ])
    console.log('  Appointments created')
  }

  // Step 11: Queue, waitlist, callbacks, notifications
  console.log('\nStep 11: Creating queue, waitlist, callbacks, notifications...')

  if (patientId && downtownId) {
    await supabase.from('queue_entries').insert([
      { patient_id: patientId, clinic_id: downtownId, queue_number: 1, status: 'in_progress' },
      { clinic_id: downtownId, patient_name: 'Walk-in Patient A', queue_number: 2, status: 'waiting' },
      { clinic_id: downtownId, patient_name: 'Walk-in Patient B', queue_number: 3, status: 'waiting' },
    ])

    await supabase.from('waitlist_entries').insert([
      { patient_id: patientId, clinic_id: clinicIds['maple-medical-centre'] || downtownId, status: 'waiting', position: 1, notes: 'Prefer morning appointment' },
    ])

    await supabase.from('callback_requests').insert([
      { patient_id: patientId, clinic_id: downtownId, phone: '(416) 555-0101', reason: 'Need to discuss test results', preferred_time: 'After 2pm', status: 'pending' },
    ])

    await supabase.from('notifications').insert([
      { user_id: patientId, type: 'appointment_reminder', title: 'Upcoming Appointment', message: 'You have an appointment at Downtown Walk-in Clinic in 2 days.', is_read: false },
      { user_id: patientId, type: 'waitlist_update', title: 'Waitlist Update', message: 'You are now #1 on the waitlist at Maple Medical Centre.', is_read: false },
    ])
  }
  console.log('  Data created')

  // Step 12: Audit logs
  console.log('\nStep 12: Creating audit logs...')
  const adminId = userIdMap['platformadmin@example.com']
  if (adminId) {
    await supabase.from('audit_logs').insert([
      { user_id: adminId, action: 'clinic_approved', table_name: 'clinics' },
      { user_id: adminId, action: 'platform_seed_completed', table_name: 'system' },
    ])
  }
  console.log('  Audit logs created')

  console.log('\n=== Seed Complete ===')
  console.log('\nDemo Credentials (all passwords: password123):')
  console.log('  Patient:        patient@example.com')
  console.log('  Clinic Staff:   staff@downtownclinic.com')
  console.log('  Practitioner:   doctor@downtownclinic.com')
  console.log('  Clinic Admin:   admin@downtownclinic.com')
  console.log('  Platform Admin: platformadmin@example.com')
}

seed().catch(console.error)
