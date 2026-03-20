'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerCluster from 'react-leaflet-cluster'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
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
  const prevClinicCount = useRef(clinics.length)

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

  // Auto-fit bounds when filtered results change
  useEffect(() => {
    if (clinics.length === 0) return
    // Only auto-fit when the count changes (i.e. user searched/filtered)
    if (clinics.length === prevClinicCount.current) return
    prevClinicCount.current = clinics.length

    const points = clinics
      .map((c: any) => {
        const loc = c.clinic_locations?.[0]
        return loc?.latitude && loc?.longitude
          ? [loc.latitude, loc.longitude] as [number, number]
          : null
      })
      .filter(Boolean) as [number, number][]

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
    }
  }, [clinics, map])

  return null
}

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  let sizeClass = 'small'
  let size = 40
  if (count >= 10) { sizeClass = 'large'; size = 50 }
  else if (count >= 5) { sizeClass = 'medium'; size = 45 }

  return L.divIcon({
    html: `<div class="cluster-marker cluster-${sizeClass}">${count}</div>`,
    className: '',
    iconSize: [size, size],
  })
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
      <MarkerCluster
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
      >
        {clinics.map((clinic: any) => (
          <ClinicMarkerComponent
            key={clinic.id}
            clinic={clinic}
            isSelected={selectedClinicId === clinic.id}
            onSelect={onClinicSelect}
          />
        ))}
      </MarkerCluster>
    </MapContainer>
  )
}

export default ClinicMap
