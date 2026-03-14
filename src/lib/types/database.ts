export type UserRole = 'patient' | 'clinic_staff' | 'practitioner' | 'clinic_admin' | 'platform_admin'
export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type WaitlistStatus = 'waiting' | 'notified' | 'checked_in' | 'cancelled' | 'expired'
export type CallbackStatus = 'pending' | 'attempted' | 'completed' | 'cancelled' | 'failed'
export type QueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'no_show'
export type ClinicStatus = 'pending' | 'approved' | 'suspended' | 'disabled'
export type VirtualSessionStatus = 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type NotificationType = 'appointment_reminder' | 'appointment_update' | 'waitlist_update' | 'callback_update' | 'queue_update' | 'virtual_session' | 'general'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  date_of_birth: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  health_card_number: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
}

export interface Region {
  id: string
  name: string
  province: string
  created_at: string
}

export interface Clinic {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  status: ClinicStatus
  is_walk_in: boolean
  is_virtual: boolean
  is_appointment_only: boolean
  average_consult_duration: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ClinicLocation {
  id: string
  clinic_id: string
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number | null
  longitude: number | null
  region_id: string | null
  is_primary: boolean
  created_at: string
}

export interface ClinicHours {
  id: string
  clinic_id: string
  day_of_week: DayOfWeek
  open_time: string
  close_time: string
  is_closed: boolean
  created_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  category_id: string | null
  default_duration: number
  created_at: string
}

export interface ClinicService {
  id: string
  clinic_id: string
  service_id: string
  price: number | null
  duration_override: number | null
  is_available: boolean
  created_at: string
  service?: Service
}

export interface Practitioner {
  id: string
  profile_id: string
  clinic_id: string
  title: string | null
  specialty: string | null
  license_number: string | null
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  is_accepting_patients: boolean
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface ClinicStaff {
  id: string
  profile_id: string
  clinic_id: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface PractitionerAvailability {
  id: string
  practitioner_id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  clinic_id: string
  practitioner_id: string | null
  service_id: string | null
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  reason: string | null
  is_virtual: boolean
  checked_in_at: string | null
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  clinic?: Clinic
  practitioner?: Practitioner
  service?: Service
  patient?: Profile
}

export interface AppointmentStatusHistory {
  id: string
  appointment_id: string
  old_status: AppointmentStatus | null
  new_status: AppointmentStatus
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface WaitlistEntry {
  id: string
  patient_id: string
  clinic_id: string
  practitioner_id: string | null
  service_id: string | null
  status: WaitlistStatus
  position: number | null
  preferred_date: string | null
  preferred_time_start: string | null
  preferred_time_end: string | null
  notes: string | null
  notified_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  clinic?: Clinic
  patient?: Profile
}

export interface QueueEntry {
  id: string
  patient_id: string | null
  clinic_id: string
  practitioner_id: string | null
  patient_name: string | null
  queue_number: number
  status: QueueStatus
  check_in_time: string
  called_at: string | null
  started_at: string | null
  completed_at: string | null
  estimated_wait_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
  patient?: Profile
  practitioner?: Practitioner
}

export interface CallbackRequest {
  id: string
  patient_id: string
  clinic_id: string
  phone: string
  reason: string | null
  preferred_time: string | null
  status: CallbackStatus
  attempted_at: string | null
  completed_at: string | null
  notes: string | null
  handled_by: string | null
  created_at: string
  updated_at: string
  clinic?: Clinic
  patient?: Profile
}

export interface WaitTimeSnapshot {
  id: string
  clinic_id: string
  estimated_wait_minutes: number
  queue_depth: number
  active_practitioners: number
  is_manual_override: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface VirtualSession {
  id: string
  appointment_id: string | null
  patient_id: string
  practitioner_id: string
  clinic_id: string
  status: VirtualSessionStatus
  room_id: string | null
  started_at: string | null
  ended_at: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
  appointment?: Appointment
  patient?: Profile
  practitioner?: Practitioner
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// Extended types with joins
export interface ClinicWithDetails extends Clinic {
  clinic_locations: ClinicLocation[]
  clinic_hours: ClinicHours[]
  clinic_services: (ClinicService & { service: Service })[]
  practitioners: (Practitioner & { profile: Profile })[]
  wait_time_snapshots: WaitTimeSnapshot[]
}

export interface ClinicSearchResult extends Clinic {
  clinic_locations: ClinicLocation[]
  wait_time_snapshots: WaitTimeSnapshot[]
  clinic_services: (ClinicService & { service: Service })[]
}
