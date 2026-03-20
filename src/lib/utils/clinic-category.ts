export type ClinicCategory =
  | 'all'
  | 'walk-in'
  | 'urgent-care'
  | 'family-practice'
  | 'pharmacy'
  | 'physiotherapy'
  | 'dental'
  | 'optometry'
  | 'mental-health'
  | 'chiropractic'
  | 'naturopath'
  | 'lab'
  | 'virtual'

export const clinicCategories: { value: ClinicCategory; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'walk-in', label: 'Walk-in Clinic' },
  { value: 'urgent-care', label: 'Urgent Care' },
  { value: 'family-practice', label: 'Family Practice' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'dental', label: 'Dental' },
  { value: 'optometry', label: 'Optometry' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'chiropractic', label: 'Chiropractic' },
  { value: 'naturopath', label: 'Naturopathic' },
  { value: 'lab', label: 'Lab / Diagnostics' },
  { value: 'virtual', label: 'Virtual Care' },
]

export function getClinicCategory(clinic: any): ClinicCategory {
  const name = (clinic.name || '').toLowerCase()
  const desc = (clinic.description || '').toLowerCase()
  const text = `${name} ${desc}`

  if (text.includes('pharmacy') || text.includes('drug mart')) return 'pharmacy'
  if (text.includes('dental') || text.includes('dentist')) return 'dental'
  if (text.includes('physiotherapy') || text.includes('physio') || text.includes('rehab')) return 'physiotherapy'
  if (text.includes('optometry') || text.includes('vision care') || text.includes('eye care') || text.includes('eye exam')) return 'optometry'
  if (text.includes('mental health') || text.includes('counselling') || text.includes('counseling') || text.includes('therapy') || text.includes('psychiatric')) return 'mental-health'
  if (text.includes('chiropractic') || text.includes('chiropract')) return 'chiropractic'
  if (text.includes('naturopath') || text.includes('naturopathic')) return 'naturopath'
  if (text.includes('lifelab') || text.includes('laboratory') || (text.includes('lab') && text.includes('diagnostic'))) return 'lab'
  if (text.includes('urgent') && (text.includes('care') || text.includes('upcc'))) return 'urgent-care'
  if (clinic.is_virtual && !clinic.is_walk_in && !clinic.is_appointment_only) return 'virtual'
  if (clinic.is_appointment_only && !clinic.is_walk_in) return 'family-practice'
  return 'walk-in'
}
