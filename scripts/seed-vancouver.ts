/**
 * Seed Vancouver clinic data
 * Run with: npx tsx scripts/seed-vancouver.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Real Vancouver clinic data sourced from public directories
const vancouverClinics = [
  {
    name: 'Commercial Drive Walk-In Clinic',
    slug: 'commercial-drive-walk-in',
    description: 'Walk-in clinic on Commercial Drive accepting new patients. Online scheduling available.',
    phone: '(604) 255-5922',
    email: 'info@commercialdriveclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1515 Commercial Drive', city: 'Vancouver', province: 'BC', postal_code: 'V5L 3Y1',
    lat: 49.2716, lng: -123.0694,
  },
  {
    name: 'Cross Roads Clinic',
    slug: 'cross-roads-clinic',
    description: 'Walk-in and appointment clinic conveniently located on West Broadway.',
    phone: '(604) 568-7229',
    email: 'info@crossroadsclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '507 Broadway W', city: 'Vancouver', province: 'BC', postal_code: 'V5Z 1E6',
    lat: 49.2634, lng: -123.1157,
  },
  {
    name: 'Georgia Medical Clinic',
    slug: 'georgia-medical-clinic',
    description: 'Full-service medical clinic in the West End near Stanley Park.',
    phone: '(604) 564-6644',
    email: 'info@georgiamedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '683 Denman Street', city: 'Vancouver', province: 'BC', postal_code: 'V6G 2L3',
    lat: 49.2905, lng: -123.1372,
  },
  {
    name: 'Jabbour Medical Health Centre',
    slug: 'jabbour-medical-centre',
    description: 'Downtown Vancouver medical centre on Robson Street. Walk-ins welcome.',
    phone: '(604) 558-0123',
    email: 'info@jabbourmedical.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '212 Robson Street', city: 'Vancouver', province: 'BC', postal_code: 'V6B 6A1',
    lat: 49.2797, lng: -123.1188,
  },
  {
    name: 'Khatsahlano Medical Clinic',
    slug: 'khatsahlano-medical-clinic',
    description: 'West Broadway family and walk-in clinic serving Kitsilano.',
    phone: '(604) 731-9187',
    email: 'info@khatsahlanoclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '2685 West Broadway', city: 'Vancouver', province: 'BC', postal_code: 'V6K 2G2',
    lat: 49.2638, lng: -123.1594,
  },
  {
    name: 'Main Street Clinic',
    slug: 'main-street-clinic',
    description: 'Community medical clinic on Main Street in South Vancouver.',
    phone: '(604) 324-5935',
    email: 'info@mainstreetclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '6602 Main Street', city: 'Vancouver', province: 'BC', postal_code: 'V5X 3H2',
    lat: 49.2252, lng: -123.1008,
  },
  {
    name: 'Stein Medical Clinic',
    slug: 'stein-medical-dunsmuir',
    description: 'Downtown clinic on Dunsmuir Street. Walk-in and scheduled appointments.',
    phone: '(778) 995-7834',
    email: 'info@steinmedical.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '887 Dunsmuir Street', city: 'Vancouver', province: 'BC', postal_code: 'V6C 1N5',
    lat: 49.2856, lng: -123.1178,
  },
  {
    name: "The Doctor's Office",
    slug: 'the-doctors-office',
    description: 'Established walk-in clinic on West Broadway near VGH.',
    phone: '(604) 734-8252',
    email: 'info@thedoctorsoffice.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '777 Broadway W', city: 'Vancouver', province: 'BC', postal_code: 'V5Z 4J7',
    lat: 49.2632, lng: -123.1222,
  },
  {
    name: 'Ultima Medicentre',
    slug: 'ultima-medicentre',
    description: 'Downtown medical centre in the Bentall Centre. Serving the business district.',
    phone: '(604) 683-8138',
    email: 'info@ultimamedicentre.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1055 Dunsmuir Street', city: 'Vancouver', province: 'BC', postal_code: 'V7X 1L4',
    lat: 49.2856, lng: -123.1210,
  },
  {
    name: 'Yale Medical Centre',
    slug: 'yale-medical-centre',
    description: 'Walk-in clinic on Granville Street. Central location, open late.',
    phone: '(604) 508-3219',
    email: 'info@yalemedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1280 Granville Street', city: 'Vancouver', province: 'BC', postal_code: 'V6Z 1M4',
    lat: 49.2747, lng: -123.1306,
  },
  {
    name: 'Yaletown Medical Clinic',
    slug: 'yaletown-medical-clinic',
    description: 'Modern medical clinic in Yaletown. Walk-ins and appointments.',
    phone: '(604) 633-2474',
    email: 'info@yaletownmedical.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1296 Pacific Boulevard', city: 'Vancouver', province: 'BC', postal_code: 'V6Z 2V1',
    lat: 49.2736, lng: -123.1205,
  },
  {
    name: 'Doc-Side Medical',
    slug: 'doc-side-medical',
    description: 'Walk-in medical clinic in East Hastings serving the local community.',
    phone: '(604) 633-1234',
    email: 'info@docsidemedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '678 East Hastings Street', city: 'Vancouver', province: 'BC', postal_code: 'V6A 2S5',
    lat: 49.2815, lng: -123.0886,
  },
  {
    name: 'FirstCare Medical Centre',
    slug: 'firstcare-medical-centre',
    description: 'Walk-in clinic on Commercial Drive near Trout Lake.',
    phone: '(604) 871-1535',
    email: 'info@firstcaremedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2590 Commercial Drive', city: 'Vancouver', province: 'BC', postal_code: 'V5N 4C2',
    lat: 49.2554, lng: -123.0694,
  },
  {
    name: 'Pacific Medical Clinic Kingsway',
    slug: 'pacific-medical-kingsway',
    description: 'Family and walk-in clinic on Kingsway. Multiple practitioners on staff.',
    phone: '(604) 874-5555',
    email: 'info@pacificmedkingsway.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2032 Kingsway Avenue', city: 'Vancouver', province: 'BC', postal_code: 'V5N 2T3',
    lat: 49.2510, lng: -123.0714,
  },
  {
    name: 'Pacific Medical Clinic Fraser',
    slug: 'pacific-medical-fraser',
    description: 'Walk-in clinic on Fraser Street. Open 7 days a week.',
    phone: '(604) 301-9955',
    email: 'info@pacificmedfraser.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '6176 Fraser Street', city: 'Vancouver', province: 'BC', postal_code: 'V5W 3A1',
    lat: 49.2283, lng: -123.0887,
  },
  {
    name: 'Seymour Health Centre',
    slug: 'seymour-health-centre',
    description: 'Well-established walk-in clinic and family practice near Granville Island.',
    phone: '(604) 738-2151',
    email: 'info@seymourhealth.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 20,
    address: '1530 7th Avenue West', city: 'Vancouver', province: 'BC', postal_code: 'V6J 1S3',
    lat: 49.2646, lng: -123.1390,
  },
  {
    name: 'Vancouver Native Health Walk-in Clinic',
    slug: 'vancouver-native-health',
    description: 'Community health clinic in the Downtown Eastside. Walk-ins welcome.',
    phone: '(604) 254-9949',
    email: 'info@vnhs.net',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '449 East Hastings Street', city: 'Vancouver', province: 'BC', postal_code: 'V6A 1P5',
    lat: 49.2815, lng: -123.0937,
  },
  {
    name: 'Babylon by TELUS Health',
    slug: 'babylon-telus-health',
    description: 'TELUS Health clinic offering virtual and in-person care on Robson Street.',
    phone: '(855) 577-8838',
    email: 'info@telushealth.com',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '238 Robson Street', city: 'Vancouver', province: 'BC', postal_code: 'V6B 0E7',
    lat: 49.2799, lng: -123.1164,
  },
  {
    name: 'Metrohealth Clinic',
    slug: 'metrohealth-clinic',
    description: 'Walk-in and family practice on Kingsway in the Metrotown area.',
    phone: '(604) 433-3341',
    email: 'info@metrohealthclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '4879 Kingsway', city: 'Vancouver', province: 'BC', postal_code: 'V5H 4T6',
    lat: 49.2295, lng: -123.0132,
  },
  {
    name: 'WELL Health - Grandview',
    slug: 'well-health-grandview',
    description: 'WELL Health medical centre on Grandview Highway. Walk-in and appointments.',
    phone: '(604) 434-2222',
    email: 'info@wellhealth.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '3185 Grandview Highway', city: 'Vancouver', province: 'BC', postal_code: 'V5M 2E9',
    lat: 49.2574, lng: -123.0440,
  },
  {
    name: 'Chaldecott Medical Clinic',
    slug: 'chaldecott-medical-clinic',
    description: 'Appointment-based family practice in Dunbar. Serving families since 1985.',
    phone: '(604) 261-9494',
    email: 'info@chaldecottmedical.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 20,
    address: '4186 Dunbar Street', city: 'Vancouver', province: 'BC', postal_code: 'V6S 2E7',
    lat: 49.2468, lng: -123.1858,
  },
  {
    name: 'Sina Medical & Aesthetics Clinic',
    slug: 'sina-medical-clinic',
    description: 'Medical and aesthetics clinic on Smithe Street downtown.',
    phone: '(604) 336-7462',
    email: 'info@sinamedical.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 20,
    address: '505 Smithe Street', city: 'Vancouver', province: 'BC', postal_code: 'V6B 6H1',
    lat: 49.2782, lng: -123.1215,
  },
  {
    name: 'Vital Health Clinic',
    slug: 'vital-health-clinic',
    description: 'Walk-in clinic on West 4th Avenue near Kitsilano Beach.',
    phone: '(604) 558-4825',
    email: 'info@vitalhealthclinic.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1855 4th Avenue W', city: 'Vancouver', province: 'BC', postal_code: 'V6J 1M5',
    lat: 49.2676, lng: -123.1470,
  },
  {
    name: 'City Centre Urgent Primary Care Centre',
    slug: 'city-centre-upcc',
    description: 'Vancouver Coastal Health urgent care centre. For non-emergency urgent needs.',
    phone: '(604) 642-5050',
    email: 'info@vch.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '1290 Hornby Street', city: 'Vancouver', province: 'BC', postal_code: 'V6Z 0A3',
    lat: 49.2765, lng: -123.1315,
  },
  {
    name: 'REACH Urgent and Primary Care Centre',
    slug: 'reach-upcc',
    description: 'Community-based urgent primary care centre on Commercial Drive.',
    phone: '(604) 215-6210',
    email: 'info@reachcentre.bc.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '1145 Commercial Drive', city: 'Vancouver', province: 'BC', postal_code: 'V5L 3X3',
    lat: 49.2755, lng: -123.0694,
  },
  {
    name: 'Northeast Urgent and Primary Care Centre',
    slug: 'northeast-upcc',
    description: 'Urgent primary care centre serving Northeast Vancouver communities.',
    phone: '(604) 216-3138',
    email: 'info@vch.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '102-2788 East Hastings Street', city: 'Vancouver', province: 'BC', postal_code: 'V5K 1Z9',
    lat: 49.2812, lng: -123.0395,
  },
  {
    name: 'Matters Of Health Medical Clinic',
    slug: 'matters-of-health',
    description: 'Family medical clinic on West Boulevard in Kerrisdale.',
    phone: '(604) 558-4633',
    email: 'info@mattersofhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '5591 West Boulevard', city: 'Vancouver', province: 'BC', postal_code: 'V6M 3W6',
    lat: 49.2354, lng: -123.1560,
  },
  {
    name: 'South Vancouver Medical Clinic',
    slug: 'south-vancouver-medical',
    description: 'Walk-in clinic near Marine Drive serving the Marpole community.',
    phone: '(604) 323-0077',
    email: 'info@southvanmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '350 Marine Drive SE', city: 'Vancouver', province: 'BC', postal_code: 'V5X 2S5',
    lat: 49.2090, lng: -123.1016,
  },
  {
    name: 'CarePoint Commercial Drive',
    slug: 'carepoint-commercial-drive',
    description: 'CarePoint Medical Centers location on Commercial Drive.',
    phone: '(604) 254-5554',
    email: 'info@carepointmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1623 Commercial Drive', city: 'Vancouver', province: 'BC', postal_code: 'V5L 3Y3',
    lat: 49.2726, lng: -123.0694,
  },
  {
    name: 'CarePoint Joyce Street',
    slug: 'carepoint-joyce-street',
    description: 'CarePoint Medical Centers location near Joyce-Collingwood SkyTrain.',
    phone: '(604) 436-0800',
    email: 'info@carepointmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '5138 Joyce Street', city: 'Vancouver', province: 'BC', postal_code: 'V5R 4H1',
    lat: 49.2384, lng: -123.0283,
  },
]

// Realistic wait times (minutes)
const waitTimeOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60]

function randomWait() {
  return waitTimeOptions[Math.floor(Math.random() * waitTimeOptions.length)]
}

async function seed() {
  console.log('=== MyHealthMap Vancouver Seed ===\n')

  // Step 1: Create region
  console.log('Step 1: Creating Metro Vancouver region...')
  const { data: regionData, error: regionErr } = await supabase.from('regions').upsert(
    { name: 'Metro Vancouver', province: 'BC' },
    { onConflict: 'name' }
  ).select().single()

  if (regionErr) {
    console.error('Region error:', regionErr.message)
    process.exit(1)
  }
  const regionId = regionData.id
  console.log(`  [OK] Region: ${regionId}`)

  // Step 2: Create service categories
  console.log('\nStep 2: Creating service categories...')
  const categories = [
    { name: 'Primary Care', description: 'General health services including check-ups and consultations' },
    { name: 'Urgent Care', description: 'Non-emergency urgent medical services' },
    { name: 'Mental Health', description: 'Counseling, therapy, and mental health assessments' },
    { name: 'Preventive Care', description: 'Vaccinations, screenings, and wellness checks' },
    { name: 'Specialist', description: 'Specialized medical consultations' },
    { name: 'Virtual Care', description: 'Telemedicine and virtual consultations' },
  ]
  const { data: catData } = await supabase.from('service_categories').upsert(
    categories, { onConflict: 'name' }
  ).select()
  const catMap: Record<string, string> = {}
  catData?.forEach(c => { catMap[c.name] = c.id })
  console.log(`  [OK] ${catData?.length || 0} categories`)

  // Step 3: Create services
  console.log('\nStep 3: Creating services...')
  const services = [
    { name: 'General Check-up', description: 'Routine health examination', category_id: catMap['Primary Care'], default_duration: 20 },
    { name: 'Walk-in Consultation', description: 'Drop-in medical consultation', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Flu Shot', description: 'Annual influenza vaccination', category_id: catMap['Preventive Care'], default_duration: 10 },
    { name: 'Blood Work', description: 'Blood test and lab work requisition', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Prescription Renewal', description: 'Renew existing prescriptions', category_id: catMap['Primary Care'], default_duration: 10 },
    { name: 'Minor Injury Treatment', description: 'Cuts, sprains, and minor injuries', category_id: catMap['Urgent Care'], default_duration: 20 },
    { name: 'Skin Condition', description: 'Rashes, acne, and skin concerns', category_id: catMap['Primary Care'], default_duration: 15 },
    { name: 'Mental Health Consultation', description: 'Initial mental health assessment', category_id: catMap['Mental Health'], default_duration: 30 },
    { name: 'Virtual Consultation', description: 'Remote video consultation', category_id: catMap['Virtual Care'], default_duration: 15 },
    { name: 'STI Testing', description: 'Sexually transmitted infection screening', category_id: catMap['Preventive Care'], default_duration: 15 },
    { name: 'Travel Medicine', description: 'Travel vaccinations and health advice', category_id: catMap['Preventive Care'], default_duration: 20 },
    { name: 'Sports Physical', description: 'Physical exam for sports clearance', category_id: catMap['Primary Care'], default_duration: 20 },
    { name: 'Chronic Disease Management', description: 'Ongoing management of chronic conditions', category_id: catMap['Primary Care'], default_duration: 30 },
  ]
  const { data: svcData } = await supabase.from('services').upsert(services, { onConflict: 'name' }).select()
  const svcMap: Record<string, string> = {}
  svcData?.forEach(s => { svcMap[s.name] = s.id })
  console.log(`  [OK] ${svcData?.length || 0} services`)

  // Step 4: Create clinics with locations and hours
  console.log('\nStep 4: Creating 30 Vancouver clinics...')
  const clinicIds: Record<string, string> = {}

  for (const def of vancouverClinics) {
    const { address, city, province, postal_code, lat, lng, ...clinicFields } = def
    const clinicData = {
      ...clinicFields,
      status: 'approved' as const,
    }

    const { data: clinic, error } = await supabase.from('clinics').upsert(
      clinicData, { onConflict: 'slug' }
    ).select().single()

    if (error) {
      console.error(`  [ERROR] ${def.name}: ${error.message}`)
      continue
    }
    clinicIds[def.slug] = clinic.id
    console.log(`  [OK] ${def.name}`)

    // Create location
    // First check if location already exists for this clinic
    const { data: existingLoc } = await supabase.from('clinic_locations')
      .select('id')
      .eq('clinic_id', clinic.id)
      .limit(1)

    if (!existingLoc || existingLoc.length === 0) {
      await supabase.from('clinic_locations').insert({
        clinic_id: clinic.id,
        address,
        city,
        province,
        postal_code,
        latitude: lat,
        longitude: lng,
        region_id: regionId,
        is_primary: true,
      })
    }

    // Create hours (check if already exist)
    const { data: existingHours } = await supabase.from('clinic_hours')
      .select('id')
      .eq('clinic_id', clinic.id)
      .limit(1)

    if (!existingHours || existingHours.length === 0) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
      const hoursData = days.map(day => {
        const isSunday = day === 'sunday'
        const isSaturday = day === 'saturday'
        // Vary hours by clinic type
        const isUrgentCare = def.slug.includes('upcc')
        return {
          clinic_id: clinic.id,
          day_of_week: day,
          open_time: isSunday ? (isUrgentCare ? '08:00' : '10:00') : isSaturday ? '09:00' : '08:00',
          close_time: isSunday ? (isUrgentCare ? '22:00' : '16:00') : isSaturday ? '16:00' : isUrgentCare ? '22:00' : '18:00',
          is_closed: isSunday && !isUrgentCare && def.is_appointment_only,
        }
      })
      await supabase.from('clinic_hours').insert(hoursData)
    }
  }

  // Step 5: Assign services to clinics
  console.log('\nStep 5: Assigning services to clinics...')
  const baseServices = ['Walk-in Consultation', 'Prescription Renewal', 'Blood Work']
  const extendedServices = ['General Check-up', 'Flu Shot', 'Skin Condition', 'Minor Injury Treatment']
  const urgentServices = ['Minor Injury Treatment', 'Walk-in Consultation', 'Blood Work', 'Prescription Renewal']
  const virtualServices = ['Virtual Consultation', 'Prescription Renewal', 'Mental Health Consultation']

  for (const [slug, clinicId] of Object.entries(clinicIds)) {
    const def = vancouverClinics.find(c => c.slug === slug)!
    let assignServices: string[]

    if (slug.includes('upcc')) {
      assignServices = urgentServices
    } else if (def.is_virtual) {
      assignServices = [...baseServices, ...extendedServices, ...virtualServices]
    } else if (def.is_appointment_only) {
      assignServices = ['General Check-up', 'Chronic Disease Management', 'Mental Health Consultation', 'Blood Work', 'Prescription Renewal']
    } else {
      assignServices = [...baseServices, ...extendedServices.slice(0, Math.floor(Math.random() * 3) + 1)]
    }

    // Deduplicate
    const uniqueServices = [...new Set(assignServices)]

    for (const svcName of uniqueServices) {
      const sId = svcMap[svcName]
      if (!sId) continue
      await supabase.from('clinic_services').upsert({
        clinic_id: clinicId,
        service_id: sId,
        is_available: true,
      }, { onConflict: 'clinic_id,service_id' })
    }
  }
  console.log('  [OK] Services assigned to all clinics')

  // Step 6: Wait time snapshots
  console.log('\nStep 6: Creating wait time snapshots...')
  for (const [slug, clinicId] of Object.entries(clinicIds)) {
    const wait = randomWait()
    const queue = Math.max(0, Math.floor(wait / 8))
    const practitioners = Math.floor(Math.random() * 3) + 1

    await supabase.from('wait_time_snapshots').insert({
      clinic_id: clinicId,
      estimated_wait_minutes: wait,
      queue_depth: queue,
      active_practitioners: practitioners,
      is_manual_override: false,
    })
  }
  console.log('  [OK] Wait times created for all clinics')

  // Step 7: Create demo auth users
  console.log('\nStep 7: Creating demo users...')
  const demoUsers = [
    { email: 'patient@demo.com', password: 'password123', full_name: 'Alex Chen', phone: '(604) 555-0101', role: 'patient', city: 'Vancouver', province: 'BC', postal_code: 'V6B 1A1' },
    { email: 'staff@demo.com', password: 'password123', full_name: 'Jordan Lee', phone: '(604) 555-0102', role: 'clinic_staff', city: 'Vancouver', province: 'BC', postal_code: 'V6Z 1M4' },
    { email: 'doctor@demo.com', password: 'password123', full_name: 'Dr. Sarah Kim', phone: '(604) 555-0103', role: 'practitioner', city: 'Vancouver', province: 'BC', postal_code: 'V6J 1S3' },
    { email: 'admin@demo.com', password: 'password123', full_name: 'Platform Admin', phone: '(604) 555-0100', role: 'platform_admin', city: 'Vancouver', province: 'BC', postal_code: 'V6B 1A1' },
  ]

  const userIdMap: Record<string, string> = {}

  for (const user of demoUsers) {
    const { data: listData } = await supabase.auth.admin.listUsers()
    const existing = listData?.users?.find(u => u.email === user.email)
    let userId: string

    if (existing) {
      userId = existing.id
      console.log(`  [SKIP] ${user.email} (exists)`)
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

  console.log('\n=== Seed Complete! ===')
  console.log(`\n  ${Object.keys(clinicIds).length} Vancouver clinics seeded`)
  console.log(`  ${svcData?.length || 0} services`)
  console.log(`  ${catData?.length || 0} categories`)
  console.log('\nDemo Credentials (password: password123):')
  console.log('  Patient:        patient@demo.com')
  console.log('  Clinic Staff:   staff@demo.com')
  console.log('  Doctor:         doctor@demo.com')
  console.log('  Admin:          admin@demo.com')
}

seed().catch(console.error)
