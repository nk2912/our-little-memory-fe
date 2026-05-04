import type { FormEvent } from 'react'
import { useState } from 'react'
import { GooglePlacePicker } from './GooglePlacePicker'
import type { Place } from '../types'

type Props = {
  place?: Place | null
  onCancel?: () => void
  onSubmit: (payload: FormData) => void
}

export function PlaceForm({ place, onCancel, onSubmit }: Props) {
  const [address, setAddress] = useState(place?.address ?? '')
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? '')

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
    if (!place) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{place ? 'Edit place' : 'Add place'}</h2>
      <input name="name" placeholder="Mandalay" defaultValue={place?.name ?? ''} required />
      <input name="address" placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
      <input name="image" type="file" accept="image/*" />
      <GooglePlacePicker
        lat={Number(latitude) || null}
        lng={Number(longitude) || null}
        onChange={(location) => {
          if (location.address) setAddress(location.address)
          setLatitude(String(location.lat))
          setLongitude(String(location.lng))
        }}
      />
      <input name="latitude" type="number" step="any" placeholder="Latitude" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
      <input name="longitude" type="number" step="any" placeholder="Longitude" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{place ? 'Update place' : 'Save place'}</button>
      </div>
    </form>
  )
}
