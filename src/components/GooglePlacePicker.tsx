import { GoogleMap, Marker, StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'

const libraries: 'places'[] = ['places']
const defaultCenter = { lat: 21.9588, lng: 96.0891 }

type Props = {
  lat?: number | null
  lng?: number | null
  query?: string
  onChange: (location: { address?: string; lat: number; lng: number }) => void
}

export function GooglePlacePicker({ lat, lng, query, onChange }: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const [fallbackValue, setFallbackValue] = useState('')
  const [marker, setMarker] = useState(() => ({
    lat: Number(lat) || defaultCenter.lat,
    lng: Number(lng) || defaultCenter.lng,
  }))

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries,
  })

  const resolveAddress = (next: { lat: number; lng: number }) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: next }, (results, status) => {
      if (status === 'OK' && results?.[0]?.formatted_address) {
        onChange({ ...next, address: results[0].formatted_address })
      }
    })
  }

  const updateLocation = (next: { lat: number; lng: number }, address?: string) => {
    setMarker(next)
    onChange({ ...next, address })
    if (!address && window.google?.maps?.Geocoder) resolveAddress(next)
  }

  const parseCoordinates = (value: string) => {
    const text = decodeURIComponent(value.trim())
    const patterns = [
      /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (!match) continue
      const next = { lat: Number(match[1]), lng: Number(match[2]) }
      if (Number.isFinite(next.lat) && Number.isFinite(next.lng)) return next
    }

    return null
  }

  const openGoogleMaps = () => {
    const search = query?.trim() || fallbackValue.trim() || `${marker.lat},${marker.lng}`
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`, '_blank', 'noopener,noreferrer')
  }

  const handleFallbackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFallbackValue(value)
    const next = parseCoordinates(value)
    if (next) updateLocation(next, query)
  }

  if (!apiKey) {
    return (
      <div className="map-placeholder map-fallback">
        <div>
          <strong>Choose location on Google Maps</strong>
          <p>Open Maps, pick a place, then paste its coordinates or share link here.</p>
        </div>
        <button type="button" onClick={openGoogleMaps}>Open Google Maps</button>
        <input
          aria-label="Google Maps coordinates or share link"
          placeholder="Paste 21.9588, 96.0891 or Google Maps link"
          value={fallbackValue}
          onChange={handleFallbackChange}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="map-placeholder">
        <strong>Map could not load</strong>
        <p>Check your Google Maps API key and enabled APIs.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="map-placeholder"><strong>Loading map</strong></div>
  }

  return (
    <div className="place-picker">
      <StandaloneSearchBox
        onLoad={(box) => {
          searchBoxRef.current = box
        }}
        onPlacesChanged={() => {
          const place = searchBoxRef.current?.getPlaces()?.[0]
          const location = place?.geometry?.location
          if (!location) return
          updateLocation(
            { lat: location.lat(), lng: location.lng() },
            place.formatted_address || place.name,
          )
        }}
      >
        <input className="map-search" placeholder="Search and choose place from Google Maps" />
      </StandaloneSearchBox>

      <GoogleMap
        center={marker}
        mapContainerClassName="map-canvas"
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        zoom={13}
        onClick={(event) => {
          if (!event.latLng) return
          updateLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })
        }}
      >
        <Marker
          draggable
          position={marker}
          onDragEnd={(event) => {
            if (!event.latLng) return
            updateLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })
          }}
        />
      </GoogleMap>
    </div>
  )
}
