'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Search, Clock, MapPin, Filter, X, Users, Building2,
  Video, ArrowUpDown, ChevronDown,
} from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, isClinicOpenNow } from '@/lib/utils'

function ClinicsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    openNow: false,
    walkIn: false,
    virtual: false,
    shortWait: false,
  })
  const [sortBy, setSortBy] = useState<'name' | 'wait_time'>('name')
  const [showFilters, setShowFilters] = useState(false)

  const fetchClinics = useCallback(async () => {
    setLoading(true)

    let results: any[] = []
    try {
      const res = await fetch('/api/clinics')
      const data = await res.json()
      results = Array.isArray(data) ? data : []
    } catch {
      results = []
    }

    if (filters.walkIn) results = results.filter((c: any) => c.is_walk_in)
    if (filters.virtual) results = results.filter((c: any) => c.is_virtual)

    // Client-side filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      results = results.filter((c: any) => {
        const nameMatch = c.name.toLowerCase().includes(q)
        const cityMatch = c.clinic_locations?.some((l: any) => l.city.toLowerCase().includes(q))
        const postalMatch = c.clinic_locations?.some((l: any) => l.postal_code.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, '')))
        return nameMatch || cityMatch || postalMatch
      })
    }

    if (filters.openNow) {
      results = results.filter((c: any) => isClinicOpenNow(c.clinic_hours || []))
    }

    if (filters.shortWait) {
      results = results.filter((c: any) => {
        const wait = c.wait_time_snapshots?.[0]?.estimated_wait_minutes
        return wait !== undefined && wait <= 30
      })
    }

    // Sort
    if (sortBy === 'wait_time') {
      results.sort((a: any, b: any) => {
        const aWait = a.wait_time_snapshots?.[0]?.estimated_wait_minutes ?? 999
        const bWait = b.wait_time_snapshots?.[0]?.estimated_wait_minutes ?? 999
        return aWait - bWait
      })
    }

    setClinics(results)
    setLoading(false)
  }, [searchQuery, filters, sortBy])

  useEffect(() => {
    fetchClinics()
  }, [fetchClinics])

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find a Clinic</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by city, postal code, or clinic name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSortBy(sortBy === 'name' ? 'wait_time' : 'name')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortBy === 'name' ? 'Name' : 'Wait Time'}
              </Button>
            </div>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-4 p-4 bg-white rounded-xl border border-gray-200">
              {[
                { key: 'openNow', label: 'Open Now' },
                { key: 'walkIn', label: 'Walk-in' },
                { key: 'virtual', label: 'Virtual' },
                { key: 'shortWait', label: '< 30 min wait' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters[key as keyof typeof filters]
                      ? 'bg-teal-100 text-teal-800 border border-teal-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ openNow: false, walkIn: false, virtual: false, shortWait: false })}
                  className="px-3 py-1.5 rounded-full text-sm text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Searching...' : `${clinics.length} clinic${clinics.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : clinics.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No clinics found"
            description="Try adjusting your search or filters to find clinics near you."
            action={
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setFilters({ openNow: false, walkIn: false, virtual: false, shortWait: false })
              }}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic: any) => {
              const location = clinic.clinic_locations?.[0]
              const latestWait = clinic.wait_time_snapshots?.[0]
              const isOpen = isClinicOpenNow(clinic.clinic_hours || [])
              const serviceNames = clinic.clinic_services?.slice(0, 3).map((cs: any) => cs.service?.name).filter(Boolean)

              return (
                <Link key={clinic.id} href={`/clinics/${clinic.id}`}>
                  <Card className="hover:shadow-md transition-all h-full group">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                            {clinic.name}
                          </h3>
                          {location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{location.address}, {location.city}</span>
                            </p>
                          )}
                        </div>
                        <Badge variant={isOpen ? 'success' : 'secondary'} className="shrink-0 ml-2">
                          {isOpen ? 'Open' : 'Closed'}
                        </Badge>
                      </div>

                      {clinic.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-2">{clinic.description}</p>
                      )}

                      <div className="flex items-center flex-wrap gap-2 mt-3">
                        {latestWait && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getWaitTimeBg(latestWait.estimated_wait_minutes)}`}>
                            <Clock className="h-3 w-3" />
                            {formatWaitTime(latestWait.estimated_wait_minutes)} wait
                          </div>
                        )}
                        {latestWait && latestWait.queue_depth > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            {latestWait.queue_depth} in line
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {clinic.is_walk_in && <Badge variant="outline" className="text-xs">Walk-in</Badge>}
                        {clinic.is_virtual && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />Virtual
                          </Badge>
                        )}
                        {serviceNames?.map((name: string) => (
                          <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function ClinicsPage() {
  return <Suspense><ClinicsContent /></Suspense>
}
