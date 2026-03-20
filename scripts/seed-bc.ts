/**
 * Seed BC-wide clinic and allied health data
 * Run with: npx tsx scripts/seed-bc.ts
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

interface ClinicDef {
  name: string
  slug: string
  description: string
  phone: string
  email: string
  is_walk_in: boolean
  is_virtual: boolean
  is_appointment_only: boolean
  average_consult_duration: number
  address: string
  city: string
  province: string
  postal_code: string
  lat: number
  lng: number
  region: string
  type: 'walk-in' | 'urgent-care' | 'family' | 'virtual' | 'pharmacy' | 'physiotherapy' | 'dental' | 'optometry' | 'mental-health' | 'chiropractic' | 'naturopath' | 'lab'
}

// ===== BC-WIDE CLINICS AND ALLIED HEALTH PRACTICES =====

const bcClinics: ClinicDef[] = [
  // ===== BURNABY =====
  {
    name: 'Burnaby Central Medical Clinic',
    slug: 'burnaby-central-medical',
    description: 'Walk-in and family practice clinic near Metrotown serving the Burnaby community.',
    phone: '(604) 434-1421',
    email: 'info@burnabycentralmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '4300 Kingsway', city: 'Burnaby', province: 'BC', postal_code: 'V5H 1Z4',
    lat: 49.2295, lng: -123.0032, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Metrotown Walk-In Clinic',
    slug: 'metrotown-walk-in',
    description: 'Convenient walk-in clinic inside Metropolis at Metrotown mall.',
    phone: '(604) 438-2221',
    email: 'info@metrotownwalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '4700 Kingsway #1020', city: 'Burnaby', province: 'BC', postal_code: 'V5H 4M1',
    lat: 49.2267, lng: -123.0016, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Burnaby Physiotherapy & Sport Injury Clinic',
    slug: 'burnaby-physiotherapy',
    description: 'Physiotherapy, sports rehabilitation, and massage therapy services.',
    phone: '(604) 298-4878',
    email: 'info@burnabyphysio.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '3885 Henning Drive #101', city: 'Burnaby', province: 'BC', postal_code: 'V5C 6N5',
    lat: 49.2648, lng: -122.9858, region: 'Metro Vancouver', type: 'physiotherapy',
  },
  {
    name: 'Burnaby Heights Pharmacy',
    slug: 'burnaby-heights-pharmacy',
    description: 'Community pharmacy offering vaccinations, medication reviews, and minor ailment care.',
    phone: '(604) 299-9211',
    email: 'info@burnabyheightsrx.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 10,
    address: '3995 Hastings Street', city: 'Burnaby', province: 'BC', postal_code: 'V5C 2H8',
    lat: 49.2813, lng: -122.9955, region: 'Metro Vancouver', type: 'pharmacy',
  },
  {
    name: 'Burnaby Vision Care',
    slug: 'burnaby-vision-care',
    description: 'Comprehensive eye exams, contact lens fittings, and optical services.',
    phone: '(604) 291-0123',
    email: 'info@burnabyvisioncare.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 30,
    address: '4885 Kingsway #211', city: 'Burnaby', province: 'BC', postal_code: 'V5H 4T2',
    lat: 49.2278, lng: -122.9955, region: 'Metro Vancouver', type: 'optometry',
  },

  // ===== SURREY =====
  {
    name: 'Surrey Central City Medical Clinic',
    slug: 'surrey-central-city-medical',
    description: 'Walk-in and family medical clinic at Central City mall near SkyTrain.',
    phone: '(604) 589-3322',
    email: 'info@surreycentralmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '10153 King George Boulevard', city: 'Surrey', province: 'BC', postal_code: 'V3T 2W1',
    lat: 49.1897, lng: -122.8490, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Guildford Medical Clinic',
    slug: 'guildford-medical-clinic',
    description: 'Walk-in and appointment clinic in Guildford Town Centre area.',
    phone: '(604) 588-4411',
    email: 'info@guildfordmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '10252 152nd Street', city: 'Surrey', province: 'BC', postal_code: 'V3R 6N7',
    lat: 49.1905, lng: -122.8016, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Newton Medical Centre',
    slug: 'newton-medical-centre',
    description: 'Full-service medical centre in Newton with walk-in availability.',
    phone: '(604) 594-3311',
    email: 'info@newtonmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '7337 137A Street', city: 'Surrey', province: 'BC', postal_code: 'V3W 1A3',
    lat: 49.1345, lng: -122.8352, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Fleetwood Dental Centre',
    slug: 'fleetwood-dental-centre',
    description: 'Family and cosmetic dentistry serving Fleetwood and South Surrey.',
    phone: '(604) 575-0808',
    email: 'info@fleetwooddental.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '16030 Fraser Highway #103', city: 'Surrey', province: 'BC', postal_code: 'V4N 0G3',
    lat: 49.1620, lng: -122.7696, region: 'Metro Vancouver', type: 'dental',
  },
  {
    name: 'Surrey Urgent Primary Care Centre',
    slug: 'surrey-upcc',
    description: 'Fraser Health urgent primary care centre. Open evenings and weekends.',
    phone: '(604) 953-4900',
    email: 'info@fraserhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '9656 King George Boulevard', city: 'Surrey', province: 'BC', postal_code: 'V3T 2V5',
    lat: 49.1854, lng: -122.8490, region: 'Metro Vancouver', type: 'urgent-care',
  },
  {
    name: 'South Surrey Chiropractic',
    slug: 'south-surrey-chiropractic',
    description: 'Chiropractic care, acupuncture, and rehabilitation services.',
    phone: '(604) 535-7373',
    email: 'info@southsurreychiro.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 30,
    address: '1656 Martin Drive #108', city: 'Surrey', province: 'BC', postal_code: 'V4A 6E7',
    lat: 49.0490, lng: -122.8270, region: 'Metro Vancouver', type: 'chiropractic',
  },
  {
    name: 'LifeLabs Surrey',
    slug: 'lifelabs-surrey',
    description: 'Medical laboratory for blood work, testing, and diagnostics.',
    phone: '(604) 431-7206',
    email: 'info@lifelabs.com',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '10233 153rd Street #100', city: 'Surrey', province: 'BC', postal_code: 'V3R 0Z7',
    lat: 49.1890, lng: -122.7990, region: 'Metro Vancouver', type: 'lab',
  },

  // ===== RICHMOND =====
  {
    name: 'Richmond Medical Centre',
    slug: 'richmond-medical-centre',
    description: 'Walk-in clinic and family practice in central Richmond.',
    phone: '(604) 270-9633',
    email: 'info@richmondmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '6060 Minoru Boulevard #210', city: 'Richmond', province: 'BC', postal_code: 'V6Y 2V7',
    lat: 49.1660, lng: -123.1365, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Steveston Family Practice',
    slug: 'steveston-family-practice',
    description: 'Family medicine in Steveston Village. Accepting new patients.',
    phone: '(604) 277-8844',
    email: 'info@stevestonfamily.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 20,
    address: '3811 Chatham Street #230', city: 'Richmond', province: 'BC', postal_code: 'V7E 2Z6',
    lat: 49.1275, lng: -123.1828, region: 'Metro Vancouver', type: 'family',
  },
  {
    name: 'Richmond Shoppers Drug Mart Pharmacy',
    slug: 'richmond-sdm-pharmacy',
    description: 'Full-service pharmacy with vaccinations and minor ailment assessments.',
    phone: '(604) 278-8522',
    email: 'info@shoppersdrugmart.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 10,
    address: '6551 No. 3 Road', city: 'Richmond', province: 'BC', postal_code: 'V6Y 2B6',
    lat: 49.1700, lng: -123.1365, region: 'Metro Vancouver', type: 'pharmacy',
  },

  // ===== NORTH VANCOUVER / WEST VANCOUVER =====
  {
    name: 'North Vancouver Urgent Primary Care Centre',
    slug: 'north-van-upcc',
    description: 'VCH urgent primary care centre on Lonsdale. Open evenings and weekends.',
    phone: '(604) 983-6700',
    email: 'info@vch.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '221 West Esplanade #300', city: 'North Vancouver', province: 'BC', postal_code: 'V7M 3J3',
    lat: 49.3111, lng: -123.0762, region: 'Metro Vancouver', type: 'urgent-care',
  },
  {
    name: 'Lonsdale Medical Clinic',
    slug: 'lonsdale-medical-clinic',
    description: 'Walk-in and family medicine in Lower Lonsdale near the Quay.',
    phone: '(604) 988-5131',
    email: 'info@lonsdalemedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '145 Lonsdale Avenue #202', city: 'North Vancouver', province: 'BC', postal_code: 'V7M 2E7',
    lat: 49.3117, lng: -123.0762, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Lynn Valley Physiotherapy',
    slug: 'lynn-valley-physio',
    description: 'Physiotherapy, sports medicine, and IMS/acupuncture on the North Shore.',
    phone: '(604) 985-0202',
    email: 'info@lynnvalleyphysio.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '1233 Lynn Valley Road #204', city: 'North Vancouver', province: 'BC', postal_code: 'V7J 0A2',
    lat: 49.3392, lng: -123.0403, region: 'Metro Vancouver', type: 'physiotherapy',
  },
  {
    name: 'Park Royal Medical Clinic',
    slug: 'park-royal-medical',
    description: 'Walk-in and family practice at Park Royal Shopping Centre.',
    phone: '(604) 925-2422',
    email: 'info@parkroyalmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '925 Main Street #210', city: 'West Vancouver', province: 'BC', postal_code: 'V7T 2Z3',
    lat: 49.3270, lng: -123.1355, region: 'Metro Vancouver', type: 'walk-in',
  },

  // ===== NEW WESTMINSTER =====
  {
    name: 'Royal City Medical Clinic',
    slug: 'royal-city-medical',
    description: 'Walk-in clinic on Columbia Street in downtown New Westminster.',
    phone: '(604) 521-2511',
    email: 'info@royalcitymedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '624 Columbia Street', city: 'New Westminster', province: 'BC', postal_code: 'V3M 1A5',
    lat: 49.2028, lng: -122.9108, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Sapperton Dental Centre',
    slug: 'sapperton-dental',
    description: 'Family dentistry, orthodontics, and emergency dental services.',
    phone: '(604) 520-6600',
    email: 'info@sappertondental.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '405 East Columbia Street #101', city: 'New Westminster', province: 'BC', postal_code: 'V3L 3X1',
    lat: 49.2260, lng: -122.8920, region: 'Metro Vancouver', type: 'dental',
  },

  // ===== COQUITLAM / PORT COQUITLAM / PORT MOODY =====
  {
    name: 'Coquitlam Centre Walk-In Clinic',
    slug: 'coquitlam-centre-walk-in',
    description: 'Walk-in clinic at Coquitlam Centre mall near Lincoln SkyTrain.',
    phone: '(604) 941-9393',
    email: 'info@coquitlamcentrewalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2929 Barnet Highway #2360', city: 'Coquitlam', province: 'BC', postal_code: 'V3B 5R5',
    lat: 49.2747, lng: -122.7939, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Westwood Medical Clinic',
    slug: 'westwood-medical-clinic',
    description: 'Family and walk-in medical clinic in Westwood Plateau.',
    phone: '(604) 945-6622',
    email: 'info@westwoodmedical.ca',
    is_walk_in: true, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2748 Lougheed Highway #700', city: 'Port Coquitlam', province: 'BC', postal_code: 'V3B 6P2',
    lat: 49.2625, lng: -122.7800, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Tri-Cities Mental Health Centre',
    slug: 'tri-cities-mental-health',
    description: 'Counselling, therapy, and psychiatric services for the Tri-Cities area.',
    phone: '(604) 461-2235',
    email: 'info@tricitiesmentalhealth.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 50,
    address: '201 Ioco Road', city: 'Port Moody', province: 'BC', postal_code: 'V3H 4G3',
    lat: 49.2846, lng: -122.8564, region: 'Metro Vancouver', type: 'mental-health',
  },

  // ===== LANGLEY =====
  {
    name: 'Langley Walk-In Medical Clinic',
    slug: 'langley-walk-in-clinic',
    description: 'Walk-in and family practice in downtown Langley City.',
    phone: '(604) 534-2144',
    email: 'info@langleywalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '20316 56th Avenue #106', city: 'Langley', province: 'BC', postal_code: 'V3A 3Y7',
    lat: 49.1048, lng: -122.6584, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'Willowbrook Chiropractic',
    slug: 'willowbrook-chiropractic',
    description: 'Chiropractic care, massage therapy, and injury rehabilitation.',
    phone: '(604) 533-5535',
    email: 'info@willowbrookchiro.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 30,
    address: '19653 Willowbrook Drive #235', city: 'Langley', province: 'BC', postal_code: 'V2Y 1A5',
    lat: 49.1280, lng: -122.6605, region: 'Metro Vancouver', type: 'chiropractic',
  },

  // ===== ABBOTSFORD / CHILLIWACK (FRASER VALLEY) =====
  {
    name: 'Abbotsford Regional Hospital Walk-In',
    slug: 'abbotsford-regional-walk-in',
    description: 'Walk-in medical clinic near Abbotsford Regional Hospital.',
    phone: '(604) 851-4700',
    email: 'info@abbotsfordwalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '32900 Marshall Road #104', city: 'Abbotsford', province: 'BC', postal_code: 'V2S 1K2',
    lat: 49.0384, lng: -122.2855, region: 'Fraser Valley', type: 'walk-in',
  },
  {
    name: 'McCallum Road Medical Clinic',
    slug: 'mccallum-road-medical',
    description: 'Family and walk-in clinic on McCallum Road in central Abbotsford.',
    phone: '(604) 859-9696',
    email: 'info@mccallummedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2581 McCallum Road #101', city: 'Abbotsford', province: 'BC', postal_code: 'V2S 3R3',
    lat: 49.0489, lng: -122.3208, region: 'Fraser Valley', type: 'walk-in',
  },
  {
    name: 'Abbotsford Naturopathic Clinic',
    slug: 'abbotsford-naturopathic',
    description: 'Naturopathic medicine, IV therapy, and functional medicine.',
    phone: '(604) 776-2432',
    email: 'info@abbotsfordnaturopath.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 45,
    address: '33771 George Ferguson Way #103', city: 'Abbotsford', province: 'BC', postal_code: 'V2S 2M5',
    lat: 49.0532, lng: -122.3285, region: 'Fraser Valley', type: 'naturopath',
  },
  {
    name: 'Chilliwack Medical Clinic',
    slug: 'chilliwack-medical-clinic',
    description: 'Full-service walk-in and family clinic in downtown Chilliwack.',
    phone: '(604) 792-4641',
    email: 'info@chilliwackmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '45540 Market Way #102', city: 'Chilliwack', province: 'BC', postal_code: 'V2R 0G4',
    lat: 49.1573, lng: -121.9522, region: 'Fraser Valley', type: 'walk-in',
  },
  {
    name: 'Chilliwack Lake Road Dental',
    slug: 'chilliwack-lake-road-dental',
    description: 'General and family dentistry in Chilliwack. New patients welcome.',
    phone: '(604) 858-6624',
    email: 'info@chilliwackdental.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '45920 First Avenue', city: 'Chilliwack', province: 'BC', postal_code: 'V2P 7K1',
    lat: 49.1687, lng: -121.9468, region: 'Fraser Valley', type: 'dental',
  },

  // ===== VICTORIA =====
  {
    name: 'James Bay Urgent Primary Care Centre',
    slug: 'james-bay-upcc',
    description: 'Island Health urgent care centre in James Bay. Evening and weekend hours.',
    phone: '(250) 953-3300',
    email: 'info@islandhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '547 Michigan Street', city: 'Victoria', province: 'BC', postal_code: 'V8V 1S5',
    lat: 48.4108, lng: -123.3681, region: 'Vancouver Island', type: 'urgent-care',
  },
  {
    name: 'Westshore Urgent Primary Care Centre',
    slug: 'westshore-upcc',
    description: 'Island Health urgent care serving Langford, Colwood, and the Westshore.',
    phone: '(250) 519-3490',
    email: 'info@islandhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '2781 Millstream Road', city: 'Langford', province: 'BC', postal_code: 'V9B 3S6',
    lat: 48.4580, lng: -123.5064, region: 'Vancouver Island', type: 'urgent-care',
  },
  {
    name: 'Cook Street Village Medical Clinic',
    slug: 'cook-street-village-medical',
    description: 'Walk-in and family practice in Cook Street Village, Victoria.',
    phone: '(250) 386-2126',
    email: 'info@cookstreetmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '230 Cook Street', city: 'Victoria', province: 'BC', postal_code: 'V8V 3X5',
    lat: 48.4122, lng: -123.3576, region: 'Vancouver Island', type: 'walk-in',
  },
  {
    name: 'Island Sexual Health',
    slug: 'island-sexual-health',
    description: 'Sexual and reproductive health clinic. Confidential services available.',
    phone: '(250) 592-3479',
    email: 'info@islandsexualhealth.org',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '3960 Quadra Street #101', city: 'Victoria', province: 'BC', postal_code: 'V8X 4A3',
    lat: 48.4440, lng: -123.3540, region: 'Vancouver Island', type: 'walk-in',
  },
  {
    name: 'Victoria Wellness Naturopathic',
    slug: 'victoria-wellness-naturopathic',
    description: 'Naturopathic medicine, nutrition counselling, and herbal medicine.',
    phone: '(250) 590-7809',
    email: 'info@victoriawellness.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 45,
    address: '1175 Cook Street #203', city: 'Victoria', province: 'BC', postal_code: 'V8V 4A1',
    lat: 48.4230, lng: -123.3576, region: 'Vancouver Island', type: 'naturopath',
  },
  {
    name: 'Oak Bay Optometry',
    slug: 'oak-bay-optometry',
    description: 'Comprehensive eye care, pediatric eye exams, and contact lens services.',
    phone: '(250) 598-3811',
    email: 'info@oakbayoptometry.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 30,
    address: '2193 Oak Bay Avenue', city: 'Victoria', province: 'BC', postal_code: 'V8R 1G3',
    lat: 48.4320, lng: -123.3230, region: 'Vancouver Island', type: 'optometry',
  },

  // ===== NANAIMO =====
  {
    name: 'Nanaimo Urgent Primary Care Centre',
    slug: 'nanaimo-upcc',
    description: 'Island Health urgent care centre serving central Vancouver Island.',
    phone: '(250) 739-6950',
    email: 'info@islandhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '190 Wallace Street', city: 'Nanaimo', province: 'BC', postal_code: 'V9R 5B1',
    lat: 49.1666, lng: -123.9401, region: 'Vancouver Island', type: 'urgent-care',
  },
  {
    name: 'Harbour City Medical Clinic',
    slug: 'harbour-city-medical',
    description: 'Walk-in and family practice in downtown Nanaimo.',
    phone: '(250) 753-1131',
    email: 'info@harbourcitymedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1 Terminal Avenue', city: 'Nanaimo', province: 'BC', postal_code: 'V9R 5C8',
    lat: 49.1648, lng: -123.9380, region: 'Vancouver Island', type: 'walk-in',
  },
  {
    name: 'Woodgrove Dental',
    slug: 'woodgrove-dental',
    description: 'Family dentistry near Woodgrove Centre. Emergency dental available.',
    phone: '(250) 390-1010',
    email: 'info@woodgrovedental.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '6631 Island Highway North #7', city: 'Nanaimo', province: 'BC', postal_code: 'V9T 4T7',
    lat: 49.2088, lng: -124.0190, region: 'Vancouver Island', type: 'dental',
  },

  // ===== KELOWNA (OKANAGAN) =====
  {
    name: 'Kelowna Urgent Primary Care Centre',
    slug: 'kelowna-upcc',
    description: 'Interior Health urgent care centre. Walk-in for non-emergency urgent needs.',
    phone: '(250) 469-7070',
    email: 'info@interiorhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '1340 Ellis Street', city: 'Kelowna', province: 'BC', postal_code: 'V1Y 9N8',
    lat: 49.8863, lng: -119.4955, region: 'Okanagan', type: 'urgent-care',
  },
  {
    name: 'Orchard Medical Centre',
    slug: 'orchard-medical-centre',
    description: 'Walk-in and family clinic on Harvey Avenue in central Kelowna.',
    phone: '(250) 763-3321',
    email: 'info@orchardmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1890 Cooper Road', city: 'Kelowna', province: 'BC', postal_code: 'V1Y 8B7',
    lat: 49.8805, lng: -119.4480, region: 'Okanagan', type: 'walk-in',
  },
  {
    name: 'Kelowna Physiotherapy & Sports Clinic',
    slug: 'kelowna-physio-sports',
    description: 'Physiotherapy, kinesiology, and sports injury rehabilitation.',
    phone: '(250) 862-3500',
    email: 'info@kelownaphysio.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '1626 Richter Street #103', city: 'Kelowna', province: 'BC', postal_code: 'V1Y 2M3',
    lat: 49.8840, lng: -119.4870, region: 'Okanagan', type: 'physiotherapy',
  },
  {
    name: 'Mission Park Pharmacy',
    slug: 'mission-park-pharmacy',
    description: 'Community pharmacy with vaccinations, medication management, and minor ailment care.',
    phone: '(250) 860-3784',
    email: 'info@missionparkrx.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 10,
    address: '3155 Lakeshore Road #107', city: 'Kelowna', province: 'BC', postal_code: 'V1W 3S9',
    lat: 49.8630, lng: -119.4625, region: 'Okanagan', type: 'pharmacy',
  },
  {
    name: 'Okanagan Mental Health & Counselling',
    slug: 'okanagan-mental-health',
    description: 'Individual and family counselling, CBT, and trauma therapy.',
    phone: '(250) 868-5888',
    email: 'info@okanaganmentalhealth.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: true,
    average_consult_duration: 50,
    address: '1708 Dolphin Avenue #202', city: 'Kelowna', province: 'BC', postal_code: 'V1Y 9S4',
    lat: 49.8850, lng: -119.4940, region: 'Okanagan', type: 'mental-health',
  },

  // ===== KAMLOOPS =====
  {
    name: 'Kamloops Urgent Primary Care Centre',
    slug: 'kamloops-upcc',
    description: 'Interior Health urgent care centre in Kamloops. Walk-in available.',
    phone: '(250) 314-2256',
    email: 'info@interiorhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '311 Columbia Street', city: 'Kamloops', province: 'BC', postal_code: 'V2C 2T1',
    lat: 50.6745, lng: -120.3273, region: 'Thompson-Okanagan', type: 'urgent-care',
  },
  {
    name: 'North Shore Medical Clinic Kamloops',
    slug: 'north-shore-medical-kamloops',
    description: 'Walk-in and family practice on the North Shore of Kamloops.',
    phone: '(250) 376-9555',
    email: 'info@northshoremedkamloops.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '700 Tranquille Road', city: 'Kamloops', province: 'BC', postal_code: 'V2B 3H9',
    lat: 50.6850, lng: -120.3580, region: 'Thompson-Okanagan', type: 'walk-in',
  },

  // ===== PRINCE GEORGE (NORTHERN BC) =====
  {
    name: 'Prince George Urgent Primary Care Centre',
    slug: 'prince-george-upcc',
    description: 'Northern Health urgent care centre in Prince George.',
    phone: '(250) 565-7422',
    email: 'info@northernhealth.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 20,
    address: '1600 15th Avenue', city: 'Prince George', province: 'BC', postal_code: 'V2L 3X3',
    lat: 53.9171, lng: -122.7497, region: 'Northern BC', type: 'urgent-care',
  },
  {
    name: 'Pine Centre Medical Clinic',
    slug: 'pine-centre-medical',
    description: 'Walk-in and family practice at Pine Centre Mall.',
    phone: '(250) 563-7878',
    email: 'info@pinecentremedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '3055 Massey Drive #230', city: 'Prince George', province: 'BC', postal_code: 'V2N 2S9',
    lat: 53.9066, lng: -122.7854, region: 'Northern BC', type: 'walk-in',
  },
  {
    name: 'Northern Physiotherapy & Rehab',
    slug: 'northern-physio-rehab',
    description: 'Physiotherapy, occupational therapy, and work injury rehabilitation.',
    phone: '(250) 564-7711',
    email: 'info@northernphysio.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '1705 3rd Avenue', city: 'Prince George', province: 'BC', postal_code: 'V2L 3G7',
    lat: 53.9180, lng: -122.7540, region: 'Northern BC', type: 'physiotherapy',
  },

  // ===== WHISTLER / SQUAMISH =====
  {
    name: 'Whistler Medical Clinic',
    slug: 'whistler-medical-clinic',
    description: 'Walk-in clinic serving Whistler residents and visitors year-round.',
    phone: '(604) 932-3977',
    email: 'info@whistlermedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '4380 Lorimer Road #202', city: 'Whistler', province: 'BC', postal_code: 'V8E 1A5',
    lat: 50.1163, lng: -122.9574, region: 'Sea-to-Sky', type: 'walk-in',
  },
  {
    name: 'Sea to Sky Physiotherapy Squamish',
    slug: 'sea-to-sky-physio-squamish',
    description: 'Physiotherapy and sports medicine in downtown Squamish.',
    phone: '(604) 567-2227',
    email: 'info@seatoskyphysio.ca',
    is_walk_in: false, is_virtual: false, is_appointment_only: true,
    average_consult_duration: 45,
    address: '38551 Loggers Lane #201', city: 'Squamish', province: 'BC', postal_code: 'V8B 0H2',
    lat: 49.7016, lng: -123.1558, region: 'Sea-to-Sky', type: 'physiotherapy',
  },

  // ===== MAPLE RIDGE / MISSION =====
  {
    name: 'Maple Ridge Walk-In Clinic',
    slug: 'maple-ridge-walk-in',
    description: 'Walk-in medical clinic on Lougheed Highway in Maple Ridge.',
    phone: '(604) 463-5575',
    email: 'info@mapleridgewalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '22425 Dewdney Trunk Road #105', city: 'Maple Ridge', province: 'BC', postal_code: 'V2X 3J9',
    lat: 49.2192, lng: -122.5987, region: 'Metro Vancouver', type: 'walk-in',
  },

  // ===== DELTA / WHITE ROCK =====
  {
    name: 'Tsawwassen Medical Clinic',
    slug: 'tsawwassen-medical-clinic',
    description: 'Walk-in and family practice in Tsawwassen serving South Delta.',
    phone: '(604) 943-2244',
    email: 'info@tsawwassenmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '1208 56th Street', city: 'Delta', province: 'BC', postal_code: 'V4L 2A4',
    lat: 49.0075, lng: -123.0820, region: 'Metro Vancouver', type: 'walk-in',
  },
  {
    name: 'White Rock Medical Clinic',
    slug: 'white-rock-medical',
    description: 'Walk-in and family practice near White Rock beach.',
    phone: '(604) 531-9112',
    email: 'info@whiterockmedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '15331 16th Avenue #101', city: 'White Rock', province: 'BC', postal_code: 'V4A 1R3',
    lat: 49.0266, lng: -122.7835, region: 'Metro Vancouver', type: 'walk-in',
  },

  // ===== PENTICTON / VERNON (OKANAGAN) =====
  {
    name: 'Penticton Walk-In Clinic',
    slug: 'penticton-walk-in',
    description: 'Walk-in medical clinic on Main Street in downtown Penticton.',
    phone: '(250) 490-0007',
    email: 'info@pentictonwalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '301 Main Street', city: 'Penticton', province: 'BC', postal_code: 'V2A 5B7',
    lat: 49.4991, lng: -119.5937, region: 'Okanagan', type: 'walk-in',
  },
  {
    name: 'Vernon Jubilee Hospital Walk-In',
    slug: 'vernon-jubilee-walk-in',
    description: 'Walk-in clinic near Vernon Jubilee Hospital.',
    phone: '(250) 545-2211',
    email: 'info@vernonwalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '2101 32nd Street', city: 'Vernon', province: 'BC', postal_code: 'V1T 5L2',
    lat: 50.2672, lng: -119.2720, region: 'Okanagan', type: 'walk-in',
  },

  // ===== COURTENAY / CAMPBELL RIVER (NORTH ISLAND) =====
  {
    name: 'Comox Valley Walk-In Clinic',
    slug: 'comox-valley-walk-in',
    description: 'Walk-in medical clinic serving the Comox Valley.',
    phone: '(250) 338-1422',
    email: 'info@comoxvalleywalkin.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '460 5th Street', city: 'Courtenay', province: 'BC', postal_code: 'V9N 1J7',
    lat: 49.6841, lng: -124.9936, region: 'Vancouver Island', type: 'walk-in',
  },
  {
    name: 'Campbell River Medical Clinic',
    slug: 'campbell-river-medical',
    description: 'Walk-in and family practice in downtown Campbell River.',
    phone: '(250) 287-7441',
    email: 'info@campbellrivermedical.ca',
    is_walk_in: true, is_virtual: false, is_appointment_only: false,
    average_consult_duration: 15,
    address: '994 Shoppers Row', city: 'Campbell River', province: 'BC', postal_code: 'V9W 2C5',
    lat: 50.0244, lng: -125.2475, region: 'Vancouver Island', type: 'walk-in',
  },

  // ===== TELEHEALTH / PROVINCE-WIDE VIRTUAL =====
  {
    name: 'Maple Virtual Care BC',
    slug: 'maple-virtual-care-bc',
    description: 'On-demand virtual doctor visits. Available 24/7 across British Columbia.',
    phone: '(844) 627-5382',
    email: 'support@getmaple.ca',
    is_walk_in: false, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '100 King Street West #5600', city: 'Vancouver', province: 'BC', postal_code: 'V6B 1S8',
    lat: 49.2827, lng: -123.1207, region: 'Metro Vancouver', type: 'virtual',
  },
  {
    name: 'Telus Health MyCare',
    slug: 'telus-health-mycare',
    description: 'Virtual healthcare app by TELUS. See a doctor from your phone, anywhere in BC.',
    phone: '(888) 663-4483',
    email: 'support@telushealth.com',
    is_walk_in: false, is_virtual: true, is_appointment_only: false,
    average_consult_duration: 15,
    address: '510 West Georgia Street', city: 'Vancouver', province: 'BC', postal_code: 'V6B 0M3',
    lat: 49.2812, lng: -123.1171, region: 'Metro Vancouver', type: 'virtual',
  },
]

// Wait time options by type
const waitTimeOptions: Record<string, number[]> = {
  'walk-in': [10, 15, 20, 25, 30, 35, 40, 45],
  'urgent-care': [15, 20, 25, 30, 40, 50, 60],
  'family': [5, 10, 15],
  'virtual': [0, 5, 10],
  'pharmacy': [5, 10, 15],
  'physiotherapy': [0, 5, 10],
  'dental': [5, 10, 15],
  'optometry': [5, 10],
  'mental-health': [0, 5],
  'chiropractic': [5, 10],
  'naturopath': [0, 5],
  'lab': [10, 15, 20, 30],
}

function randomWait(type: string) {
  const opts = waitTimeOptions[type] || [15, 20, 25]
  return opts[Math.floor(Math.random() * opts.length)]
}

// Services by practice type
const servicesByType: Record<string, string[]> = {
  'walk-in': ['Walk-in Consultation', 'Prescription Renewal', 'Blood Work', 'Flu Shot', 'Skin Condition'],
  'urgent-care': ['Minor Injury Treatment', 'Walk-in Consultation', 'Blood Work', 'Prescription Renewal'],
  'family': ['General Check-up', 'Chronic Disease Management', 'Prescription Renewal', 'Blood Work', 'Mental Health Consultation'],
  'virtual': ['Virtual Consultation', 'Prescription Renewal', 'Mental Health Consultation'],
  'pharmacy': ['Flu Shot', 'Prescription Renewal'],
  'physiotherapy': ['Sports Physical'],
  'dental': ['General Check-up'],
  'optometry': ['General Check-up'],
  'mental-health': ['Mental Health Consultation', 'Virtual Consultation'],
  'chiropractic': ['Sports Physical'],
  'naturopath': ['General Check-up', 'Chronic Disease Management'],
  'lab': ['Blood Work', 'STI Testing'],
}

async function seed() {
  console.log('=== MyHealthMap BC-Wide Seed ===\n')
  console.log(`Seeding ${bcClinics.length} clinics and allied health practices across BC...\n`)

  // Step 1: Create regions
  console.log('Step 1: Creating BC regions...')
  const regionNames = [...new Set(bcClinics.map(c => c.region))]
  const regionMap: Record<string, string> = {}

  for (const name of regionNames) {
    const { data, error } = await supabase.from('regions').upsert(
      { name, province: 'BC' }, { onConflict: 'name' }
    ).select().single()
    if (error) {
      console.error(`  Region error (${name}):`, error.message)
      continue
    }
    regionMap[name] = data.id
    console.log(`  [OK] ${name}`)
  }

  // Step 2: Ensure services exist
  console.log('\nStep 2: Verifying services...')
  const { data: svcData } = await supabase.from('services').select('id, name')
  const svcMap: Record<string, string> = {}
  svcData?.forEach(s => { svcMap[s.name] = s.id })
  console.log(`  [OK] ${svcData?.length || 0} services available`)

  // Step 3: Create clinics
  console.log('\nStep 3: Creating clinics...')
  let created = 0
  let skipped = 0

  for (const def of bcClinics) {
    const { address, city, province, postal_code, lat, lng, region, type, ...clinicFields } = def

    const { data: clinic, error } = await supabase.from('clinics').upsert(
      { ...clinicFields, status: 'approved' as const },
      { onConflict: 'slug' }
    ).select().single()

    if (error) {
      console.error(`  [ERROR] ${def.name}: ${error.message}`)
      continue
    }

    // Create location if not exists
    const { data: existingLoc } = await supabase.from('clinic_locations')
      .select('id').eq('clinic_id', clinic.id).limit(1)

    if (!existingLoc || existingLoc.length === 0) {
      await supabase.from('clinic_locations').insert({
        clinic_id: clinic.id,
        address, city, province, postal_code,
        latitude: lat, longitude: lng,
        region_id: regionMap[region],
        is_primary: true,
      })
      created++
      console.log(`  [NEW] ${def.name} (${city})`)
    } else {
      skipped++
      console.log(`  [SKIP] ${def.name} (exists)`)
    }

    // Create hours if not exists
    const { data: existingHours } = await supabase.from('clinic_hours')
      .select('id').eq('clinic_id', clinic.id).limit(1)

    if (!existingHours || existingHours.length === 0) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
      const isUrgent = type === 'urgent-care'
      const isVirtual = type === 'virtual'
      const hoursData = days.map(day => {
        const isSun = day === 'sunday'
        const isSat = day === 'saturday'
        return {
          clinic_id: clinic.id,
          day_of_week: day,
          open_time: isVirtual ? '00:00' : isSun ? (isUrgent ? '08:00' : '10:00') : isSat ? '09:00' : '08:00',
          close_time: isVirtual ? '23:59' : isSun ? (isUrgent ? '22:00' : '16:00') : isSat ? '16:00' : isUrgent ? '22:00' : '18:00',
          is_closed: isSun && def.is_appointment_only && !isVirtual,
        }
      })
      await supabase.from('clinic_hours').insert(hoursData)
    }

    // Assign services
    const assignServices = servicesByType[type] || ['Walk-in Consultation']
    for (const svcName of [...new Set(assignServices)]) {
      const sId = svcMap[svcName]
      if (!sId) continue
      await supabase.from('clinic_services').upsert({
        clinic_id: clinic.id,
        service_id: sId,
        is_available: true,
      }, { onConflict: 'clinic_id,service_id' })
    }

    // Wait time snapshot
    await supabase.from('wait_time_snapshots').insert({
      clinic_id: clinic.id,
      estimated_wait_minutes: randomWait(type),
      queue_depth: Math.floor(Math.random() * 6),
      active_practitioners: Math.floor(Math.random() * 3) + 1,
      is_manual_override: false,
    })
  }

  console.log(`\n=== Seed Complete! ===`)
  console.log(`  ${created} new clinics created`)
  console.log(`  ${skipped} existing clinics skipped`)
  console.log(`  Total: ${bcClinics.length} BC-wide clinics and allied health practices`)
  console.log(`\n  Regions: ${regionNames.join(', ')}`)
  console.log(`  Cities: ${[...new Set(bcClinics.map(c => c.city))].join(', ')}`)
}

seed().catch(console.error)
