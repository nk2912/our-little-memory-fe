import type { FormEvent } from 'react'
import type { SpecialDate } from '../types'

type Props = {
  specialDate?: SpecialDate | null
  onCancel?: () => void
  onSubmit: (payload: Partial<SpecialDate>) => void
}

export function SpecialDateForm({ specialDate, onCancel, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      special_date: String(form.get('special_date') ?? ''),
      type: String(form.get('type') ?? ''),
      remind_before_days: Number(form.get('remind_before_days')) || 0,
    })
    if (!specialDate) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{specialDate ? 'Edit special date' : 'Add special date'}</h2>
      <input name="title" placeholder="Title" defaultValue={specialDate?.title ?? ''} required />
      <textarea name="description" placeholder="Description" defaultValue={specialDate?.description ?? ''} />
      <input name="special_date" type="date" defaultValue={specialDate?.special_date ?? ''} required />
      <input name="type" placeholder="anniversary / birthday" defaultValue={specialDate?.type ?? ''} required />
      <input name="remind_before_days" type="number" min="0" defaultValue={specialDate?.remind_before_days ?? 0} />
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{specialDate ? 'Update date' : 'Save date'}</button>
      </div>
    </form>
  )
}
