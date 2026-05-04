import type { FormEvent } from 'react'
import type { Memory, Place } from '../types'

type Props = {
  memory?: Memory | null
  places: Place[]
  onCancel?: () => void
  onSubmit: (payload: Partial<Memory>) => void
}

export function MemoryForm({ memory, places, onCancel, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      memory_date: String(form.get('memory_date') ?? ''),
      mood: String(form.get('mood') ?? ''),
      place_id: Number(form.get('place_id')) || null,
      is_favorite: form.get('is_favorite') === 'on',
    })
    if (!memory) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{memory ? 'Edit memory' : 'Add memory'}</h2>
      <input name="title" placeholder="Title" defaultValue={memory?.title ?? ''} required />
      <textarea name="description" placeholder="Description" defaultValue={memory?.description ?? ''} />
      <input name="memory_date" type="date" defaultValue={memory?.memory_date ?? ''} required />
      <input name="mood" placeholder="Mood" defaultValue={memory?.mood ?? ''} />
      <select name="place_id" defaultValue={memory?.place?.id ?? memory?.place_id ?? ''}>
        <option value="">No place</option>
        {places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
      </select>
      <label className="check-row"><input name="is_favorite" type="checkbox" defaultChecked={Boolean(memory?.is_favorite)} /> Favorite</label>
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{memory ? 'Update' : 'Save'}</button>
      </div>
    </form>
  )
}
