'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { ClinicPopup } from './clinic-popup'

function getMarkerColorClass(waitMinutes: number | undefined): string {
  if (waitMinutes === undefined || waitMinutes === null) return 'wait-unknown'
  if (waitMinutes <= 15) return 'wait-green'
  if (waitMinutes <= 30) return 'wait-yellow'
  if (waitMinutes <= 60) return 'wait-orange'
  return 'wait-red'
}

function createClinicIcon(waitMinutes: number | undefined, isSelected: boolean) {
  const colorClass = getMarkerColorClass(waitMinutes)
  const label = waitMinutes !== undefined && waitMinutes !== null
    ? `${waitMinutes}`
    : '?'
  const size = isSelected ? 44 : 36

  return L.divIcon({
    className: '',
    html: `<div class="clinic-marker ${colorClass}" style="width:${size}px;height:${size}px;font-size:${isSelected ? '13' : '11'}px;${isSelected ? 'box-shadow:0 0 0 3px #0d9488, 0 2px 8px rgba(0,0,0,0.3);' : ''}">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  })
}

interface ClinicMarkerProps {
  clinic: any
  isSelected: boolean
  onSelect: (clinicId: string) => void
}

export function ClinicMarkerComponent({ clinic, isSelected, onSelect }: ClinicMarkerProps) {
  const location = clinic.clinic_locations?.[0]
  if (!location?.latitude || !location?.longitude) return null

  const latestWait = clinic.wait_time_snapshots?.[0]
  const waitMinutes = latestWait?.estimated_wait_minutes

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={createClinicIcon(waitMinutes, isSelected)}
      eventHandlers={{
        click: () => onSelect(clinic.id),
      }}
    >
      <Popup>
        <ClinicPopup clinic={clinic} />
      </Popup>
    </Marker>
  )
}
