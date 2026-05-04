import type { FormEvent } from 'react'
import type { Routine, RoutineOccurrence } from '../types'

type Props = {
  occurrence?: RoutineOccurrence | null
  routines: Routine[]
  onCancel?: () => void
  onSubmit: (payload: Partial<RoutineOccurrence>) => void
}

export function RoutineOccurrenceForm({ occurrence, routines, onCancel, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      routine_id: Number(form.get('routine_id')),
      occurrence_date: String(form.get('occurrence_date') ?? ''),
      status: String(form.get('status') ?? ''),
      note: String(form.get('note') ?? ''),
    })
    if (!occurrence) event.currentTarget.reset()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <h2>{occurrence ? 'Edit occurrence' : 'Add occurrence'}</h2>
      <select name="routine_id" defaultValue={occurrence?.routine_id ?? ''} required>
        <option value="">Choose routine</option>
        {routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.title}</option>)}
      </select>
      <input name="occurrence_date" type="date" defaultValue={occurrence?.occurrence_date ?? ''} required />
      <input name="status" placeholder="pending / done / skipped" defaultValue={occurrence?.status ?? ''} required />
      <textarea name="note" placeholder="Note" defaultValue={occurrence?.note ?? ''} />
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit">{occurrence ? 'Update occurrence' : 'Save occurrence'}</button>
      </div>
    </form>
  )
}
