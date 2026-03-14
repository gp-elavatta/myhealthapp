'use client'

import { Search, LocateFixed, Loader2 } from 'lucide-react'

interface Filters {
  openNow: boolean
  walkIn: boolean
  virtual: boolean
  shortWait: boolean
}

interface MapSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: Filters
  onFilterChange: (filters: Filters) => void
  onLocateMe: () => void
  isLocating: boolean
  resultCount: number
}

const filterOptions = [
  { key: 'openNow' as const, label: 'Open Now' },
  { key: 'walkIn' as const, label: 'Walk-in' },
  { key: 'virtual' as const, label: 'Virtual' },
  { key: 'shortWait' as const, label: '< 30 min' },
]

export function MapSearch({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onLocateMe,
  isLocating,
  resultCount,
}: MapSearchProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Search bar */}
        <div className="map-glass rounded-xl shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-2 px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clinics by name, city, or postal code..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors disabled:opacity-50 shrink-0"
              title="Use my location"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LocateFixed className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Locate Me</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map((opt) => {
            const active = filters[opt.key]
            return (
              <button
                key={opt.key}
                onClick={() =>
                  onFilterChange({ ...filters, [opt.key]: !active })
                }
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm pointer-events-auto ${
                  active
                    ? 'bg-teal-600 text-white shadow-teal-200'
                    : 'map-glass text-gray-700 hover:bg-white border border-gray-200/50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
          <span className="shrink-0 text-xs text-gray-500 map-glass px-2.5 py-1.5 rounded-full border border-gray-200/50 pointer-events-auto">
            {resultCount} clinic{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
