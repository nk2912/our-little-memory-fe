import type { FormEvent } from 'react'
import { useState } from 'react'
import { GooglePlacePicker } from './GooglePlacePicker'
import type { Place } from '../types'

type Props = {
  place?: Place | null
  onCancel?: () => void
  onResolveMapUrl?: (url: string) => Promise<{ name?: string | null; address?: string | null; latitude: number; longitude: number }>
  onSubmit: (payload: FormData) => void
}

export function PlaceForm({ place, onCancel, onResolveMapUrl, onSubmit }: Props) {
  const [name, setName] = useState(place?.name ?? '')
  const [address, setAddress] = useState(place?.address ?? '')
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? '')
  const [mapUrl, setMapUrl] = useState('')
  const [mapStatus, setMapStatus] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const image = form.get('image')
    if (image instanceof File && image.size === 0) {
      form.delete('image')
    }
    if (!form.get('latitude')) {
      form.delete('latitude')
    }
    if (!form.get('longitude')) {
      form.delete('longitude')
    }
    if (place) {
      form.append('_method', 'PATCH')
    }
    onSubmit(form)
    if (!place) {
      event.currentTarget.reset()
      setName('')
      setAddress('')
      setLatitude('')
      setLongitude('')
      setMapUrl('')
      setMapStatus('')
    }
  }

  const fillFromMapUrl = async () => {
    if (!mapUrl.trim() || !onResolveMapUrl) return
    try {
      setMapStatus('Reading map link...')
      const result = await onResolveMapUrl(mapUrl.trim())
      if (!name.trim() && result.name) setName(result.name)
      if (result.address) setAddress(result.address)
      setLatitude(String(result.latitude))
      setLongitude(String(result.longitude))
      setMapStatus('Address and coordinates filled')
    } catch (error) {
      setMapStatus(error instanceof Error ? error.message : 'Could not read map link')
    }
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{place ? 'Edit place' : 'Add place'}</h2>
      <input name="name" placeholder="Mandalay Palace" value={name} onChange={(event) => setName(event.target.value)} required />
      <input name="address" type="hidden" value={address} readOnly />
      <input name="image" type="file" accept="image/*" />
      <div className="map-url-field">
        <input
          aria-label="Google Maps link"
          placeholder="Paste Google Maps link, e.g. Mandalay Palace location"
          value={mapUrl}
          onChange={(event) => setMapUrl(event.target.value)}
        />
        <button type="button" onClick={() => void fillFromMapUrl()} disabled={!mapUrl.trim() || !onResolveMapUrl}>
          Fill from map
        </button>
      </div>
      {mapStatus && <p className="map-status">{mapStatus}</p>}
      <GooglePlacePicker
        lat={Number(latitude) || null}
        lng={Number(longitude) || null}
        query={name}
        onChange={(location) => {
          if (location.address) setAddress(location.address)
          setLatitude(String(location.lat))
          setLongitude(String(location.lng))
        }}
      />
      <input name="latitude" type="hidden" value={latitude} readOnly />
      <input name="longitude" type="hidden" value={longitude} readOnly />
      <div className="location-summary">
        <span>Selected place</span>
        <strong>{address || 'Mandalay Palace, Aungmyaythazan Township, Mandalay Region, Myanmar'}</strong>
      </div>
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{place ? 'Update place' : 'Save place'}</button>
      </div>
    </form>
  )
}
