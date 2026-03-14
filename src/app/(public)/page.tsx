'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { MapSearch } from '@/components/map/map-search'
import { ClinicListPanel } from '@/components/map/clinic-list-panel'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Spinner } from '@/components/ui/loading'
import { isClinicOpenNow } from '@/lib/utils'

const ClinicMap = dynamic(
  () => import('@/components/map/clinic-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    ),
  }
)

interface Filters {
  openNow: boolean
  walkIn: boolean
  virtual: boolean
  shortWait: boolean
}

export default function HomePage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    openNow: false,
    walkIn: false,
    virtual: false,
    shortWait: false,
  })

  const { latitude, longitude, loading: locating, locate } = useGeolocation()
  const userLocation = useMemo<[number, number] | null>(
    () => (latitude && longitude ? [latitude, longitude] : null),
    [latitude, longitude]
  )

  // Fetch clinics
  useEffect(() => {
    async function fetchClinics() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clinics')
        .select(`
          *,
          clinic_locations(*),
          clinic_hours(*),
          wait_time_snapshots(estimated_wait_minutes, queue_depth, created_at),
          clinic_services(*, service:services(*))
        `)
        .eq('status', 'approved')
        .order('name')

      setClinics(data || [])
      setLoading(false)
    }
    fetchClinics()
  }, [])

  // Filter clinics
  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const location = clinic.clinic_locations?.[0]
        const matchesName = clinic.name?.toLowerCase().includes(q)
        const matchesCity = location?.city?.toLowerCase().includes(q)
        const matchesPostal = location?.postal_code?.toLowerCase().includes(q)
        const matchesAddress = location?.address?.toLowerCase().includes(q)
        if (!matchesName && !matchesCity && !matchesPostal && !matchesAddress) {
          return false
        }
      }

      // Filters
      if (filters.openNow && !isClinicOpenNow(clinic.clinic_hours || [])) {
        return false
      }
      if (filters.walkIn && !clinic.is_walk_in) return false
      if (filters.virtual && !clinic.is_virtual) return false
      if (filters.shortWait) {
        const wait = clinic.wait_time_snapshots?.[0]?.estimated_wait_minutes
        if (wait === undefined || wait === null || wait > 30) return false
      }

      return true
    })
  }, [clinics, searchQuery, filters])

  const handleClinicSelect = useCallback((clinicId: string) => {
    setSelectedClinicId((prev) => (prev === clinicId ? null : clinicId))
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-gray-500">Loading clinics...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0">
          <ClinicMap
            clinics={filteredClinics}
            selectedClinicId={selectedClinicId}
            onClinicSelect={handleClinicSelect}
            userLocation={userLocation}
          />
        </div>

        {/* Search overlay */}
        <MapSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={setFilters}
          onLocateMe={locate}
          isLocating={locating}
          resultCount={filteredClinics.length}
        />

        {/* Clinic list panel */}
        <ClinicListPanel
          clinics={filteredClinics}
          selectedClinicId={selectedClinicId}
          onClinicSelect={handleClinicSelect}
        />
      </main>
    </div>
  )
}
