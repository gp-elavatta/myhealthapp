'use client'

import Link from 'next/link'
import { Clock, MapPin, Users, Footprints, Video } from 'lucide-react'
import { formatWaitTime, getWaitTimeBg, isClinicOpenNow } from '@/lib/utils'

interface ClinicPopupProps {
  clinic: any
}

export function ClinicPopup({ clinic }: ClinicPopupProps) {
  const location = clinic.clinic_locations?.[0]
  const latestWait = clinic.wait_time_snapshots?.[0]
  const isOpen = isClinicOpenNow(clinic.clinic_hours || [])
  const services = clinic.clinic_services?.slice(0, 3) || []

  return (
    <div className="p-4 min-w-[240px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
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
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location.address}, {location.city}</span>
        </p>
      )}

      <div className="flex items-center flex-wrap gap-1.5 mb-3">
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
            {latestWait.queue_depth} in queue
          </span>
        )}
        {clinic.is_walk_in && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
            <Footprints className="h-2.5 w-2.5" />
            Walk-in
          </span>
        )}
        {clinic.is_virtual && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
            <Video className="h-2.5 w-2.5" />
            Virtual
          </span>
        )}
      </div>

      {services.length > 0 && (
        <div className="text-[10px] text-gray-500 mb-3">
          {services.map((cs: any) => cs.service?.name).filter(Boolean).join(' · ')}
        </div>
      )}

      <Link
        href={`/clinics/${clinic.id}`}
        className="block w-full text-center text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg py-2 transition-colors"
      >
        View Details
      </Link>
    </div>
  )
}
