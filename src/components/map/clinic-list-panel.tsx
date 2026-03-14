'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, X, Clock, MapPin, Users, ChevronUp } from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, isClinicOpenNow } from '@/lib/utils'

interface ClinicListPanelProps {
  clinics: any[]
  selectedClinicId: string | null
  onClinicSelect: (clinicId: string) => void
}

function ClinicCard({
  clinic,
  isSelected,
  onSelect,
}: {
  clinic: any
  isSelected: boolean
  onSelect: () => void
}) {
  const location = clinic.clinic_locations?.[0]
  const latestWait = clinic.wait_time_snapshots?.[0]
  const isOpen = isClinicOpenNow(clinic.clinic_hours || [])

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? 'border-teal-300 bg-teal-50/50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-sm text-gray-900 leading-tight">
          {clinic.name}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isOpen
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {location && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {location.address}, {location.city}
          </span>
        </p>
      )}

      <div className="flex items-center flex-wrap gap-1.5">
        {latestWait && (
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getWaitTimeBg(latestWait.estimated_wait_minutes)}`}
          >
            <Clock className="h-2.5 w-2.5" />
            {formatWaitTime(latestWait.estimated_wait_minutes)}
          </span>
        )}
        {latestWait?.queue_depth > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            <Users className="h-2.5 w-2.5" />
            {latestWait.queue_depth}
          </span>
        )}
        {clinic.is_walk_in && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
            Walk-in
          </span>
        )}
        {clinic.is_virtual && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
            Virtual
          </span>
        )}
      </div>

      {isSelected && (
        <Link
          href={`/clinics/${clinic.id}`}
          className="block mt-2.5 text-center text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg py-1.5 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      )}
    </button>
  )
}

export function ClinicListPanel({
  clinics,
  selectedClinicId,
  onClinicSelect,
}: ClinicListPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  return (
    <>
      {/* Toggle button - desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex absolute top-4 right-4 z-[1000] items-center gap-1.5 px-3 py-2 rounded-xl map-glass shadow-lg border border-gray-200/50 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
      >
        <List className="h-4 w-4" />
        List
      </button>

      {/* Desktop: side panel */}
      {isOpen && (
        <div className="hidden md:block absolute top-0 left-0 bottom-0 z-[999] w-[380px] bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200 panel-enter">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">
              {clinics.length} Clinic{clinics.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-49px)] p-3 space-y-2">
            {clinics.map((clinic: any) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isSelected={selectedClinicId === clinic.id}
                onSelect={() => onClinicSelect(clinic.id)}
              />
            ))}
            {clinics.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500">
                No clinics match your search
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-[1000]">
        {/* Collapsed bar */}
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full map-glass border-t border-gray-200 px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-gray-700">
            {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} found
          </span>
          <ChevronUp
            className={`h-4 w-4 text-gray-400 transition-transform ${
              mobileExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expanded list */}
        {mobileExpanded && (
          <div className="bg-white border-t border-gray-100 max-h-[60vh] overflow-y-auto p-3 space-y-2 bottom-sheet-enter">
            {clinics.map((clinic: any) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isSelected={selectedClinicId === clinic.id}
                onSelect={() => {
                  onClinicSelect(clinic.id)
                  setMobileExpanded(false)
                }}
              />
            ))}
            {clinics.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">
                No clinics match your search
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
