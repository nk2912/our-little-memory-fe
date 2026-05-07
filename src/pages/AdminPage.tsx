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

type AdminSection = 'dashboard' | 'places' | 'memories' | 'routines' | 'occurrences' | 'tags' | 'specialDates'
type AdminSectionGroup = 'collections' | 'meta'

const sections: { id: AdminSection; label: string; group: AdminSectionGroup }[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'collections' },
  { id: 'places', label: 'Places', group: 'collections' },
  { id: 'memories', label: 'Memories', group: 'collections' },
  { id: 'routines', label: 'Routines', group: 'collections' },
  { id: 'occurrences', label: 'Occurrences', group: 'collections' },
  { id: 'tags', label: 'Tags', group: 'meta' },
  { id: 'specialDates', label: 'Special Dates', group: 'meta' },
]

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('olm_token') ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [section, setSection] = useState<AdminSection>('dashboard')
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

  const sectionCount = (id: AdminSection) => {
    if (id === 'dashboard') return places.length + memories.length + routines.length + specialDates.length
    if (id === 'places') return places.length
    if (id === 'memories') return memories.length
    if (id === 'routines') return routines.length
    if (id === 'occurrences') return occurrences.length
    if (id === 'tags') return tags.length
    return specialDates.length
  }

  const currentSection = sections.find((item) => item.id === section)
  const collectionSections = sections.filter((item) => item.group === 'collections')
  const metaSections = sections.filter((item) => item.group === 'meta')

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
          <strong>Memory Archive</strong>
        </a>
        <nav className="admin-nav" aria-label="Admin sections">
          <p className="nav-group-label">Collections</p>
          {collectionSections.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} type="button" onClick={() => setSection(item.id)}>
              <span className="nav-dot" aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{sectionCount(item.id)}</strong>
            </button>
          ))}
          <p className="nav-group-label">Meta</p>
          {metaSections.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} type="button" onClick={() => setSection(item.id)}>
              <span className="nav-dot" aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{sectionCount(item.id)}</strong>
            </button>
          ))}
        </nav>
        <div className="admin-account">
          <small>{user?.email ?? 'admin@example.com'}</small>
          <button type="button" onClick={logout}>
            <span className="nav-dot" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">{status}</p>
            <h1>{currentSection?.label}</h1>
          </div>
          <div className="admin-user-block">
            <p className="eyebrow">Signed in as</p>
            <strong>{user?.name ?? 'Admin'}</strong>
          </div>
          <button type="button" onClick={loadData}>Refresh</button>
        </header>

        {section === 'dashboard' && (
          <section className="admin-dashboard" key="dashboard">
            <section className="dashboard-hero">
              <div>
                <p className="eyebrow">Memory archive</p>
                <h2>{places.length + memories.length + routines.length + specialDates.length} records curated</h2>
                <p>Build the archive from places first, then connect memories, recurring routines, and important dates.</p>
              </div>
              <div className="dashboard-actions" aria-label="Quick actions">
                <button type="button" onClick={() => setSection('places')}>Add place</button>
                <button type="button" onClick={() => setSection('memories')}>Add memory</button>
              </div>
            </section>

            <section className="admin-stats">
              <article>
                <span>Places</span>
                <strong>{places.length}</strong>
                <small>{places.length ? 'Mapped locations' : 'Start here'}</small>
              </article>
              <article>
                <span>Memories</span>
                <strong>{memories.length}</strong>
                <small>{memories.length ? 'Stories saved' : 'No memories yet'}</small>
              </article>
              <article>
                <span>Routines</span>
                <strong>{routines.length}</strong>
                <small>{routines.length ? 'Habits tracked' : 'Optional plans'}</small>
              </article>
              <article>
                <span>Dates</span>
                <strong>{specialDates.length}</strong>
                <small>{specialDates.length ? 'Reminders kept' : 'Special moments'}</small>
              </article>
            </section>

            <section className="dashboard-overview">
              <article>
                <p className="eyebrow">Archive health</p>
                <h2>{places.length + memories.length + routines.length + specialDates.length} saved records</h2>
                <p>Manage the places, memories, routines, and dates that power the public archive.</p>
              </article>
              <article>
                <p className="eyebrow">Next action</p>
                <h2>{places.length ? 'Add the next memory' : 'Add your first place'}</h2>
                <p>{places.length ? 'Attach memories to a saved place so the archive map becomes richer.' : 'Start with a Mandalay place, then add memories around it.'}</p>
              </article>
            </section>
          </section>
        )}

        {section === 'places' && (
          <AdminCrudSection
            key="places"
            form={<PlaceForm place={editingPlace} onResolveMapUrl={async (url) => {
              setStatus('Reading map link')
              const result = await apiRequest<{ data: { name?: string | null; address?: string | null; latitude: number; longitude: number } }>('/places/resolve-map-url', token, {
                method: 'POST',
                body: JSON.stringify({ url }),
              })
              setStatus('Map facts filled')
              return result.data
            }} onSubmit={async (payload) => {
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
            count={places.length}
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
            key="memories"
            form={<MemoryForm memory={editingMemory} places={places} onSubmit={(payload) => saveResource('/memories', editingMemory, payload, setMemories, () => setEditingMemory(null), 'Memory')} onCancel={editingMemory ? () => setEditingMemory(null) : undefined} />}
            count={memories.length}
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
            key="routines"
            form={<RoutineForm routine={editingRoutine} places={places} onSubmit={(payload) => saveResource('/routines', editingRoutine, payload, setRoutines, () => setEditingRoutine(null), 'Routine')} onCancel={editingRoutine ? () => setEditingRoutine(null) : undefined} />}
            count={routines.length}
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
            key="occurrences"
            form={<RoutineOccurrenceForm occurrence={editingOccurrence} routines={routines} onSubmit={(payload) => saveResource('/routine-occurrences', editingOccurrence, payload, setOccurrences, () => setEditingOccurrence(null), 'Occurrence')} onCancel={editingOccurrence ? () => setEditingOccurrence(null) : undefined} />}
            count={occurrences.length}
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
            key="tags"
            form={<TagForm tag={editingTag} onSubmit={(payload) => saveResource('/tags', editingTag, payload, setTags, () => setEditingTag(null), 'Tag')} onCancel={editingTag ? () => setEditingTag(null) : undefined} />}
            count={tags.length}
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
            key="specialDates"
            form={<SpecialDateForm specialDate={editingSpecialDate} onSubmit={(payload) => saveResource('/special-dates', editingSpecialDate, payload, setSpecialDates, () => setEditingSpecialDate(null), 'Special date')} onCancel={editingSpecialDate ? () => setEditingSpecialDate(null) : undefined} />}
            count={specialDates.length}
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

function AdminCrudSection({ form, count, emptyTitle, emptyCopy, children }: { form: ReactNode; count: number; emptyTitle: string; emptyCopy: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)

  return (
    <section className="admin-grid">
      <div className="admin-form-stack">{form}</div>
      <section className="admin-list">
        <div className="admin-list-head">
          <div>
            <h2>All entries</h2>
          </div>
          <span>{count} records</span>
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
