import type { VisitAlbum } from '../types'

type Props = {
  albums: VisitAlbum[]
  onSelect: (album: VisitAlbum) => void
}

export function AlbumGrid({ albums, onSelect }: Props) {
  return (
    <section className="album-card-grid" aria-label="Memory albums">
      {albums.map((album, index) => (
        <button
          type="button"
          className="album-card"
          key={album.id}
          onClick={() => onSelect(album)}
          style={{ backgroundImage: `url(${album.image})`, animationDelay: `${index * 0.12}s` }}
        >
          <span className="album-number">0{index + 1}</span>
          <div>
            <small>{album.memories.length} memories</small>
            <strong>{album.place}</strong>
            <p>{album.title}</p>
          </div>
        </button>
      ))}
    </section>
  )
}
