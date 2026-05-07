import { useEffect, useMemo, useState } from 'react'
import { AlbumDetail } from '../components/AlbumDetail'
import { AlbumGrid } from '../components/AlbumGrid'
import { PublicHeader } from '../components/PublicHeader'
import { albumAssets, fallbackAlbumAsset } from '../data/albumAssets'
import { apiRequest } from '../lib/api'
import type { Memory, Place, VisitAlbum } from '../types'

function placeKey(place: string) {
  return place.trim().toLowerCase()
}

function createAlbums(memories: Memory[], places: Place[]): VisitAlbum[] {
  const placeMap = new Map(places.map((place) => [place.id, place]))
  const grouped = new Map<string, { place: Place | undefined; memories: Memory[] }>()

  for (const memory of memories) {
    const place = memory.place ?? (memory.place_id ? placeMap.get(memory.place_id) : undefined)
    const name = place?.name ?? 'Unmapped'
    const key = placeKey(name)
    const group = grouped.get(key) ?? { place, memories: [] }
    group.memories.push(memory)
    grouped.set(key, group)
  }

  return Array.from(grouped.entries()).map(([key, group]) => {
    const firstMemory = group.memories[0]
    const placeName = group.place?.name ?? 'Unmapped'
    const asset = albumAssets[key] ?? fallbackAlbumAsset

    return {
      id: key,
      title: firstMemory?.title ?? `${placeName} memories`,
      subtitle: firstMemory?.description ?? `Saved memories from ${placeName}.`,
      date: firstMemory?.memory_date ?? '',
      place: placeName,
      mood: firstMemory?.mood ?? 'Memory',
      image: group.place?.image_url ?? group.place?.image_path ?? asset.image,
      color: asset.color,
      memories: group.memories,
    }
  })
}

export function PublicAlbumPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [selected, setSelected] = useState<VisitAlbum | null>(null)
  const [status, setStatus] = useState('Loading albums')

  useEffect(() => {
    const token = localStorage.getItem('olm_token') ?? ''
    if (!token) {
      setStatus('Sign in from admin to load albums')
      return
    }

    Promise.all([
      apiRequest<{ data: Place[] }>('/places', token),
      apiRequest<{ data: Memory[] }>('/memories', token),
    ])
      .then(([placeData, memoryData]) => {
        setPlaces(placeData.data ?? [])
        setMemories(memoryData.data ?? [])
        setStatus('Albums synced')
      })
      .catch(() => setStatus('Could not load albums'))
  }, [])

  const albums = useMemo(() => createAlbums(memories, places), [memories, places])

  return (
    <main className="public-shell">
      <PublicHeader />

      {selected ? (
        <AlbumDetail album={selected} onBack={() => setSelected(null)} />
      ) : (
        <section className="album-home-page">
          <section className="album-intro">
            <p className="eyebrow">{status}</p>
            <h1>Our Little Map</h1>
            <p>Browse saved places and memories as albums grouped by location.</p>
          </section>

          {albums.length > 0 ? (
            <AlbumGrid albums={albums} onSelect={setSelected} />
          ) : (
            <section className="public-empty">
              <h2>No albums yet</h2>
              <p>Create places and memories in admin, then return here.</p>
              <a className="admin-link" href="/admin">Open admin</a>
            </section>
          )}
        </section>
      )}
    </main>
  )
}
