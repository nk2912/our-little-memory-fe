import type { FormEvent } from 'react'
import type { Tag } from '../types'

type Props = {
  tag?: Tag | null
  onCancel?: () => void
  onSubmit: (payload: Partial<Tag>) => void
}

export function TagForm({ tag, onCancel, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({ name: String(form.get('name') ?? ''), color: String(form.get('color') ?? '') })
    if (!tag) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{tag ? 'Edit tag' : 'Add tag'}</h2>
      <input name="name" placeholder="Tag name" defaultValue={tag?.name ?? ''} required />
      <input name="color" placeholder="#b3483e" defaultValue={tag?.color ?? ''} />
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{tag ? 'Update tag' : 'Save tag'}</button>
      </div>
    </form>
  )
}
