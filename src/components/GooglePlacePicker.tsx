import { GoogleMap, Marker, StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api'
import { useRef, useState } from 'react'

const libraries: 'places'[] = ['places']
const defaultCenter = { lat: 21.9588, lng: 96.0891 }

type Props = {
  lat?: number | null
  lng?: number | null
  onChange: (location: { address?: string; lat: number; lng: number }) => void
}

export function GooglePlacePicker({ lat, lng, onChange }: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const [marker, setMarker] = useState(() => ({
    lat: Number(lat) || defaultCenter.lat,
    lng: Number(lng) || defaultCenter.lng,
  }))

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries,
  })

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <strong>Google Map disabled</strong>
        <p>Add `VITE_GOOGLE_MAPS_API_KEY` to `fe/.env` to enable location search.</p>
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
    if (!address) resolveAddress(next)
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
