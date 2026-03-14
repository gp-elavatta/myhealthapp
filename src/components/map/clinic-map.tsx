'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { ClinicMarkerComponent } from './clinic-marker'

const DEFAULT_CENTER: [number, number] = [49.2627, -123.1207]
const DEFAULT_ZOOM = 12

interface MapControllerProps {
  center: [number, number] | null
  selectedClinicId: string | null
  clinics: any[]
}

function MapController({ center, selectedClinicId, clinics }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 })
    }
  }, [center, map])

  useEffect(() => {
    if (selectedClinicId) {
      const clinic = clinics.find((c: any) => c.id === selectedClinicId)
      const location = clinic?.clinic_locations?.[0]
      if (location?.latitude && location?.longitude) {
        map.flyTo([location.latitude, location.longitude], 15, { duration: 1 })
      }
    }
  }, [selectedClinicId, clinics, map])

  return null
}

interface ClinicMapProps {
  clinics: any[]
  selectedClinicId: string | null
  onClinicSelect: (clinicId: string) => void
  userLocation: [number, number] | null
}

export function ClinicMap({ clinics, selectedClinicId, onClinicSelect, userLocation }: ClinicMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController
        center={userLocation}
        selectedClinicId={selectedClinicId}
        clinics={clinics}
      />
      {clinics.map((clinic: any) => (
        <ClinicMarkerComponent
          key={clinic.id}
          clinic={clinic}
          isSelected={selectedClinicId === clinic.id}
          onSelect={onClinicSelect}
        />
      ))}
    </MapContainer>
  )
}

export default ClinicMap
