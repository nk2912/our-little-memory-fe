import type { FormEvent } from 'react'
import type { Place, Routine } from '../types'

type Props = {
  routine?: Routine | null
  places: Place[]
  onCancel?: () => void
  onSubmit: (payload: Partial<Routine>) => void
}

export function RoutineForm({ routine, places, onCancel, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      title: String(form.get('title') ?? ''),
      repeat_type: String(form.get('repeat_type') ?? ''),
      day_of_week: String(form.get('day_of_week') ?? ''),
      start_time: String(form.get('start_time') ?? ''),
      end_time: String(form.get('end_time') ?? ''),
      start_date: String(form.get('start_date') ?? ''),
      end_date: String(form.get('end_date') ?? ''),
      color: String(form.get('color') ?? ''),
      place_id: Number(form.get('place_id')) || null,
      is_active: form.get('is_active') === 'on',
    })
    if (!routine) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{routine ? 'Edit routine' : 'Add routine'}</h2>
      <input name="title" placeholder="Title" defaultValue={routine?.title ?? ''} required />
      <input name="repeat_type" placeholder="daily / weekly / monthly" defaultValue={routine?.repeat_type ?? ''} required />
      <input name="day_of_week" placeholder="Day of week" defaultValue={routine?.day_of_week ?? ''} />
      <input name="start_time" type="time" defaultValue={routine?.start_time ?? ''} />
      <input name="end_time" type="time" defaultValue={routine?.end_time ?? ''} />
      <input name="start_date" type="date" defaultValue={routine?.start_date ?? ''} required />
      <input name="end_date" type="date" defaultValue={routine?.end_date ?? ''} />
      <input name="color" placeholder="#1f4b45" defaultValue={routine?.color ?? ''} />
      <select name="place_id" defaultValue={routine?.place?.id ?? routine?.place_id ?? ''}>
        <option value="">No place</option>
        {places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
      </select>
      <label className="check-row"><input name="is_active" type="checkbox" defaultChecked={routine?.is_active ?? true} /> Active</label>
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{routine ? 'Update routine' : 'Save routine'}</button>
      </div>
    </form>
  )
}
