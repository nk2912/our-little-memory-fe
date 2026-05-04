import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AdminAuth } from '../components/AdminAuth'
import { MemoryForm } from '../components/MemoryForm'
import { PlaceForm } from '../components/PlaceForm'
import { RoutineForm } from '../components/RoutineForm'
import { RoutineOccurrenceForm } from '../components/RoutineOccurrenceForm'
import { SpecialDateForm } from '../components/SpecialDateForm'
import { TagForm } from '../components/TagForm'
import { apiRequest } from '../lib/api'
import type { Memory, Place, Routine, RoutineOccurrence, SpecialDate, Tag, User } from '../types'

type AdminSection = 'places' | 'memories' | 'routines' | 'occurrences' | 'tags' | 'specialDates'

const sections: { id: AdminSection; label: string }[] = [
  { id: 'places', label: 'Places' },
  { id: 'memories', label: 'Memories' },
  { id: 'routines', label: 'Routines' },
  { id: 'occurrences', label: 'Occurrences' },
  { id: 'tags', label: 'Tags' },
  { id: 'specialDates', label: 'Special Dates' },
]

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('olm_token') ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [section, setSection] = useState<AdminSection>('places')
  const [status, setStatus] = useState('Ready')

  const [places, setPlaces] = useState<Place[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [occurrences, setOccurrences] = useState<RoutineOccurrence[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])

  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [editingOccurrence, setEditingOccurrence] = useState<RoutineOccurrence | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingSpecialDate, setEditingSpecialDate] = useState<SpecialDate | null>(null)

  const loadData = useCallback(async () => {
    if (!token) return
    try {
      setStatus('Loading')
      const [me, placeData, memoryData, routineData, occurrenceData, tagData, specialDateData] = await Promise.all([
        apiRequest<{ data?: User }>('/me', token),
        apiRequest<{ data: Place[] }>('/places', token),
        apiRequest<{ data: Memory[] }>('/memories', token),
        apiRequest<{ data: Routine[] }>('/routines', token),
        apiRequest<{ data: RoutineOccurrence[] }>('/routine-occurrences', token),
        apiRequest<{ data: Tag[] }>('/tags', token),
        apiRequest<{ data: SpecialDate[] }>('/special-dates', token),
      ])
      setUser(me.data ?? (me as User))
      setPlaces(placeData.data ?? [])
      setMemories(memoryData.data ?? [])
      setRoutines(routineData.data ?? [])
      setOccurrences(occurrenceData.data ?? [])
      setTags(tagData.data ?? [])
      setSpecialDates(specialDateData.data ?? [])
      setStatus('Synced')
    } catch {
      setStatus('Could not load API data')
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadData])

  const saveResource = async <T extends { id: number }>(
    endpoint: string,
    editing: T | null,
    payload: Partial<T>,
    setItems: (updater: (items: T[]) => T[]) => void,
    clearEditing: () => void,
    label: string,
  ) => {
    const path = editing ? `${endpoint}/${editing.id}` : endpoint
    const method = editing ? 'PATCH' : 'POST'
    const result = await apiRequest<{ data: T }>(path, token, { method, body: JSON.stringify(payload) })
    setItems((items) => editing ? items.map((item) => item.id === editing.id ? result.data : item) : [result.data, ...items])
    clearEditing()
    setStatus(editing ? `${label} updated` : `${label} created`)
  }

  const deleteResource = async <T extends { id: number }>(
    endpoint: string,
    item: T,
    setItems: (updater: (items: T[]) => T[]) => void,
    label: string,
  ) => {
    await apiRequest(`${endpoint}/${item.id}`, token, { method: 'DELETE' })
    setItems((items) => items.filter((entry) => entry.id !== item.id))
    setStatus(`${label} deleted`)
  }

  const logout = () => {
    localStorage.removeItem('olm_token')
    setToken('')
    setUser(null)
  }

  if (!token) {
    return (
      <main className="admin-shell centered">
        <AdminAuth onAuthed={(nextToken, nextUser) => {
          setToken(nextToken)
          setUser(nextUser)
        }} />
      </main>
    )
  }

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <a className="brand-link" href="/">
          <span>OLM</span>
          <strong>Public albums</strong>
        </a>
        <nav className="admin-nav" aria-label="Admin sections">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} type="button" onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={logout}>Logout</button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">{status}</p>
            <h1>{sections.find((item) => item.id === section)?.label}</h1>
          </div>
          <div>
            <p className="eyebrow">Signed in</p>
            <strong>{user?.email ?? 'Admin'}</strong>
          </div>
          <button type="button" onClick={loadData}>Refresh</button>
        </header>

        <section className="admin-stats">
          <article>
            <span>Places</span>
            <strong>{places.length}</strong>
          </article>
          <article>
            <span>Memories</span>
            <strong>{memories.length}</strong>
          </article>
          <article>
            <span>Routines</span>
            <strong>{routines.length}</strong>
          </article>
          <article>
            <span>Dates</span>
            <strong>{specialDates.length}</strong>
          </article>
        </section>

        {section === 'places' && (
          <AdminCrudSection
            form={<PlaceForm place={editingPlace} onSubmit={async (payload) => {
              try {
                setStatus(editingPlace ? 'Updating place' : 'Saving place')
                const path = editingPlace ? `/places/${editingPlace.id}` : '/places'
                const result = await apiRequest<{ data: Place }>(path, token, {
                  method: 'POST',
                  body: payload,
                })
                setPlaces((items) => editingPlace ? items.map((item) => item.id === editingPlace.id ? result.data : item) : [result.data, ...items])
                setEditingPlace(null)
                setStatus(editingPlace ? 'Place updated' : 'Place created')
              } catch (error) {
                setStatus(error instanceof Error ? error.message : 'Could not save place')
              }
            }} onCancel={editingPlace ? () => setEditingPlace(null) : undefined} />}
            title="Places"
            emptyTitle="No places yet"
            emptyCopy="Add Mandalay, Pyin Oo Lwin, Sagaing, Kyouk Se, or any place from the form."
          >
            {places.map((place) => (
              <AdminRow key={place.id} title={place.name} meta={place.address || 'No address'} detail={place.image_path ? `Image: ${place.image_path}` : place.latitude && place.longitude ? `${place.latitude}, ${place.longitude}` : 'No coordinates'} onEdit={() => setEditingPlace(place)} onDelete={() => deleteResource('/places', place, setPlaces, 'Place')} />
            ))}
          </AdminCrudSection>
        )}

        {section === 'memories' && (
          <AdminCrudSection
            form={<MemoryForm memory={editingMemory} places={places} onSubmit={(payload) => saveResource('/memories', editingMemory, payload, setMemories, () => setEditingMemory(null), 'Memory')} onCancel={editingMemory ? () => setEditingMemory(null) : undefined} />}
            title="Memories"
            emptyTitle="No memories yet"
            emptyCopy="Create your first memory from the form. Once saved, it will appear here for editing and deleting."
          >
            {memories.map((memory) => (
              <AdminRow key={memory.id} title={memory.title} meta={`${memory.memory_date} - ${memory.place?.name ?? 'No place'}`} detail={memory.description} onEdit={() => setEditingMemory(memory)} onDelete={() => deleteResource('/memories', memory, setMemories, 'Memory')} />
            ))}
          </AdminCrudSection>
        )}

        {section === 'routines' && (
          <AdminCrudSection
            form={<RoutineForm routine={editingRoutine} places={places} onSubmit={(payload) => saveResource('/routines', editingRoutine, payload, setRoutines, () => setEditingRoutine(null), 'Routine')} onCancel={editingRoutine ? () => setEditingRoutine(null) : undefined} />}
            title="Routines"
            emptyTitle="No routines yet"
            emptyCopy="Add repeating routines for calendar planning."
          >
            {routines.map((routine) => (
              <AdminRow key={routine.id} title={routine.title} meta={`${routine.repeat_type} - ${routine.start_date}`} detail={routine.place?.name ?? 'No place'} onEdit={() => setEditingRoutine(routine)} onDelete={() => deleteResource('/routines', routine, setRoutines, 'Routine')} />
            ))}
          </AdminCrudSection>
        )}

        {section === 'occurrences' && (
          <AdminCrudSection
            form={<RoutineOccurrenceForm occurrence={editingOccurrence} routines={routines} onSubmit={(payload) => saveResource('/routine-occurrences', editingOccurrence, payload, setOccurrences, () => setEditingOccurrence(null), 'Occurrence')} onCancel={editingOccurrence ? () => setEditingOccurrence(null) : undefined} />}
            title="Routine Occurrences"
            emptyTitle="No occurrences yet"
            emptyCopy="Create occurrence records for a routine."
          >
            {occurrences.map((occurrence) => (
              <AdminRow key={occurrence.id} title={occurrence.status} meta={occurrence.occurrence_date} detail={occurrence.note ?? `Routine #${occurrence.routine_id}`} onEdit={() => setEditingOccurrence(occurrence)} onDelete={() => deleteResource('/routine-occurrences', occurrence, setOccurrences, 'Occurrence')} />
            ))}
          </AdminCrudSection>
        )}

        {section === 'tags' && (
          <AdminCrudSection
            form={<TagForm tag={editingTag} onSubmit={(payload) => saveResource('/tags', editingTag, payload, setTags, () => setEditingTag(null), 'Tag')} onCancel={editingTag ? () => setEditingTag(null) : undefined} />}
            title="Tags"
            emptyTitle="No tags yet"
            emptyCopy="Add tags to organize memories."
          >
            {tags.map((tag) => (
              <AdminRow key={tag.id} title={tag.name} meta={tag.color ?? 'No color'} onEdit={() => setEditingTag(tag)} onDelete={() => deleteResource('/tags', tag, setTags, 'Tag')} />
            ))}
          </AdminCrudSection>
        )}

        {section === 'specialDates' && (
          <AdminCrudSection
            form={<SpecialDateForm specialDate={editingSpecialDate} onSubmit={(payload) => saveResource('/special-dates', editingSpecialDate, payload, setSpecialDates, () => setEditingSpecialDate(null), 'Special date')} onCancel={editingSpecialDate ? () => setEditingSpecialDate(null) : undefined} />}
            title="Special Dates"
            emptyTitle="No special dates yet"
            emptyCopy="Add anniversaries, birthdays, and reminders."
          >
            {specialDates.map((date) => (
              <AdminRow key={date.id} title={date.title} meta={`${date.type} - ${date.special_date}`} detail={date.description ?? `${date.remind_before_days} reminder days`} onEdit={() => setEditingSpecialDate(date)} onDelete={() => deleteResource('/special-dates', date, setSpecialDates, 'Special date')} />
            ))}
          </AdminCrudSection>
        )}
      </section>
    </main>
  )
}

function AdminCrudSection({ form, title, emptyTitle, emptyCopy, children }: { form: ReactNode; title: string; emptyTitle: string; emptyCopy: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)

  return (
    <section className="admin-grid">
      <div className="admin-form-stack">{form}</div>
      <section className="admin-list">
        <div className="admin-list-head">
          <div>
            <p className="eyebrow">CRUD</p>
            <h1>{title}</h1>
          </div>
        </div>
        {hasChildren ? children : (
          <div className="empty-memories">
            <span>OLM</span>
            <h2>{emptyTitle}</h2>
            <p>{emptyCopy}</p>
          </div>
        )}
      </section>
    </section>
  )
}

function AdminRow({ title, meta, detail, onEdit, onDelete }: { title: string; meta?: string; detail?: string | null; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="admin-memory-row">
      <div>
        <strong>{title}</strong>
        {meta && <small>{meta}</small>}
        {detail && <p>{detail}</p>}
      </div>
      <div className="row-actions">
        <button type="button" onClick={onEdit}>Edit</button>
        <button type="button" onClick={() => void onDelete()}>Delete</button>
      </div>
    </article>
  )
}
