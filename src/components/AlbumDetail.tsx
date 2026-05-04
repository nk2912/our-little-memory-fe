import type { VisitAlbum } from '../types'

type Props = {
  album: VisitAlbum
  onBack: () => void
}

export function AlbumDetail({ album, onBack }: Props) {
  const calendarItems = album.memories.map((memory, index) => ({
    title: memory.title,
    description: memory.description,
    date: memory.memory_date,
    mood: memory.mood,
    type: index === 0 ? 'Arrival' : 'Memory',
  }))

  return (
    <section className="album-detail-page">
      <button className="back-button" type="button" onClick={onBack}>Back to albums</button>

      <article className="album-detail-hero" style={{ backgroundImage: `url(${album.image})` }}>
        <div className="visit-shade" />
        <div className="visit-index">01</div>
        <div className="visit-content">
          <p className="eyebrow">{album.date} - {album.mood}</p>
          <h2>{album.title}</h2>
          <p>{album.subtitle}</p>
          <div className="visit-tags">
            <span>{album.place}</span>
            <span>{album.memories.length} memories</span>
            <span>calendar included</span>
          </div>
        </div>
      </article>

      <section className="memory-detail-grid">
        {calendarItems.map((item, index) => (
          <article className="memory-detail-card" key={item.title}>
            <div className="memory-detail-photo" style={{ backgroundImage: `url(${album.image})` }}>
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="memory-detail-copy">
              <p className="eyebrow">{item.type} - {item.date}</p>
              <h2>{item.title}</h2>
              <p>{item.description || `${album.place} memory with its saved calendar date.`}</p>
              <div className="memory-date-chip">
                <time>{item.date.slice(5)}</time>
                <strong>{item.title}</strong>
                <small>{item.mood || album.place}</small>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}
