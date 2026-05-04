import { useEffect, useMemo, useState } from 'react'
import { AlbumDetail } from '../components/AlbumDetail'
import { AlbumGrid } from '../components/AlbumGrid'
import { PublicHeader } from '../components/PublicHeader'
import { albumAssets, fallbackAlbumAsset } from '../data/albumAssets'
import { apiRequest } from '../lib/api'
import type { Memory, VisitAlbum } from '../types'

export function PublicAlbumPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<VisitAlbum | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [status, setStatus] = useState('Loading memories')

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiRequest<{ data: Memory[] }>('/memories', '')
        setMemories(data.data ?? [])
        setStatus('Real memories')
      } catch {
        setStatus('Could not load memories')
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const albums = useMemo(() => groupMemoriesByPlace(memories), [memories])

  return (
    <main className="public-shell">
      <PublicHeader />

      {!selectedAlbum ? (
        <section className="album-home-page">
          <header className="album-intro">
            <p className="eyebrow">{status}</p>
            <h1>Choose a place to see its memories</h1>
            <p>Only memories saved in your Laravel database are shown here.</p>
          </header>
          {albums.length === 0 ? <PublicEmptyState /> : <AlbumGrid albums={albums} onSelect={setSelectedAlbum} />}
        </section>
      ) : (
        <AlbumDetail album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
      )}
    </main>
  )
}

function groupMemoriesByPlace(memories: Memory[]): VisitAlbum[] {
  const groups = new Map<string, Memory[]>()

  memories.forEach((memory) => {
    const place = memory.place?.name ?? 'No place'
    groups.set(place, [...(groups.get(place) ?? []), memory])
  })

  return Array.from(groups.entries()).map(([place, items]) => {
    const key = place.toLowerCase()
    const asset = albumAssets[key] ?? fallbackAlbumAsset
    const first = items[0]
    const placeImage = first?.place?.image_url || first?.place?.image_path

    return {
      id: key.replace(/\s+/g, '-'),
      title: `${place} Memories`,
      subtitle: first?.description || `${items.length} real memories saved for ${place}.`,
      date: first?.memory_date ?? '',
      place,
      mood: first?.mood ?? 'memory',
      image: placeImage || asset.image,
      color: asset.color,
      memories: items,
    }
  })
}

function PublicEmptyState() {
  return (
    <div className="empty-memories public-empty">
      <span>OLM</span>
      <h2>No memories yet</h2>
      <p>No real memories were found in the database. Add memories from the admin page and they will appear here.</p>
      <a className="admin-link" href="/admin">Go to admin</a>
    </div>
  )
}
