import type { VisitAlbum } from '../types'

type Props = {
  album: VisitAlbum
  onBack: () => void
}

const BG_CLASSES = ['olm-c1', 'olm-c2', 'olm-c3', 'olm-c4', 'olm-c5', 'olm-c6']

export function AlbumDetail({ album, onBack }: Props) {
  const calendarItems = album.memories.map((memory, index) => ({
    title: memory.title,
    description: memory.description,
    date: memory.memory_date,
    mood: memory.mood,
    type: index === 0 ? 'Arrival' : 'Memory',
  }))

  const bgClass = BG_CLASSES[0]

  const heroStyle = album.image
    ? { backgroundImage: `url(${album.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <>
      <style>{`
        .olm-detail {
          padding: 48px 56px 96px;
          background: #08070a;
          animation: olmDetailFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes olmDetailFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .olm-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245, 239, 224, 0.3);
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 48px;
          transition: color 0.2s;
          font-family: 'DM Mono', monospace;
        }

        .olm-detail-back:hover { color: #d4a73a; }

        /* Hero */
        .olm-detail-hero {
          position: relative;
          height: 520px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 56px;
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.6),
            0 0 0 0.5px rgba(212, 167, 58, 0.1),
            inset 0 0 0 0.5px rgba(212, 167, 58, 0.05);
        }

        .olm-detail-hero-bg {
          width: 100%;
          height: 100%;
          transition: transform 8s ease;
        }

        .olm-detail-hero:hover .olm-detail-hero-bg {
          transform: scale(1.04);
        }

        .olm-detail-hero-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%);
          pointer-events: none;
        }

        .olm-detail-hero-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,167,58,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .olm-detail-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 48px;
        }

        .olm-detail-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #f0c560;
          margin-bottom: 12px;
        }

        .olm-detail-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 300;
          line-height: 0.92;
          letter-spacing: -2.5px;
          color: #f5efe0;
          margin-bottom: 20px;
          font-style: italic;
        }

        .olm-detail-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .olm-detail-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(245, 239, 224, 0.45);
          padding: 5px 14px;
          border: 0.5px solid rgba(245, 239, 224, 0.1);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
        }

        /* Section heading */
        .olm-detail-section-head {
          margin-bottom: 36px;
        }

        .olm-detail-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #d4a73a;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .olm-detail-section-label::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: rgba(212, 167, 58, 0.15);
        }

        .olm-detail-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -1px;
          color: #f5efe0;
        }

        .olm-detail-section-title em {
          font-style: italic;
          color: #f0c560;
        }

        /* Memory grid */
        .olm-memories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .olm-mem-card {
          background: rgba(255, 255, 255, 0.02);
          border: 0.5px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s;
          animation: olmMemReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .olm-mem-card:nth-child(1) { animation-delay: 0.05s; }
        .olm-mem-card:nth-child(2) { animation-delay: 0.12s; }
        .olm-mem-card:nth-child(3) { animation-delay: 0.19s; }
        .olm-mem-card:nth-child(4) { animation-delay: 0.26s; }

        @keyframes olmMemReveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .olm-mem-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 167, 58, 0.2);
        }

        .olm-mem-img {
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        .olm-mem-img-bg {
          width: 100%;
          height: 100%;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .olm-mem-card:hover .olm-mem-img-bg { transform: scale(1.06); }

        .olm-mem-img-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%);
          pointer-events: none;
        }

        .olm-mem-idx {
          position: absolute;
          top: 14px;
          left: 14px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(240, 197, 96, 0.7);
        }

        .olm-mem-body {
          padding: 20px 22px 22px;
        }

        .olm-mem-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #d4a73a;
          margin-bottom: 8px;
        }

        .olm-mem-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: -0.3px;
          line-height: 1.1;
          color: #f5efe0;
          margin-bottom: 8px;
        }

        .olm-mem-desc {
          font-size: 13px;
          color: rgba(245, 239, 224, 0.38);
          line-height: 1.75;
          margin-bottom: 14px;
          font-family: 'Syne', system-ui, sans-serif;
        }

        .olm-mem-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          border-radius: 20px;
          background: rgba(212, 167, 58, 0.07);
          border: 0.5px solid rgba(212, 167, 58, 0.18);
        }

        .olm-mem-chip time {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 1px;
          color: #d4a73a;
        }

        .olm-mem-chip strong {
          font-size: 12px;
          font-weight: 500;
          color: #f5efe0;
          font-family: 'Syne', system-ui, sans-serif;
        }

        @media (max-width: 768px) {
          .olm-detail { padding: 32px 20px 64px; }
          .olm-detail-hero { height: 360px; }
          .olm-detail-hero-content { padding: 24px; }
          .olm-memories-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="olm-detail">
        <button className="olm-detail-back" type="button" onClick={onBack}>
          ← Back to albums
        </button>

        <div className="olm-detail-hero">
          <div
            className={`olm-detail-hero-bg ${bgClass}`}
            style={heroStyle}
          />
          <div className="olm-detail-hero-veil" />
          <div className="olm-detail-hero-glow" />
          <div className="olm-detail-hero-content">
            <p className="olm-detail-eyebrow">{album.date} · {album.mood}</p>
            <h2 className="olm-detail-title">{album.title}</h2>
            <div className="olm-detail-tags">
              <span className="olm-detail-tag">{album.place}</span>
              <span className="olm-detail-tag">{album.memories.length} memories</span>
              <span className="olm-detail-tag">Calendar included</span>
            </div>
          </div>
        </div>

        <div className="olm-detail-section-head">
          <p className="olm-detail-section-label">Memories</p>
          <h3 className="olm-detail-section-title">Within this <em>place</em></h3>
        </div>

        <div className="olm-memories-grid">
          {calendarItems.map((item, index) => (
            <article className="olm-mem-card" key={item.title + index}>
              <div className="olm-mem-img">
                <div
                  className={`olm-mem-img-bg ${bgClass}`}
                  style={heroStyle}
                />
                <div className="olm-mem-img-veil" />
                <span className="olm-mem-idx">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="olm-mem-body">
                <p className="olm-mem-eyebrow">{item.type} · {item.date?.slice(5)}</p>
                <h3 className="olm-mem-title">{item.title}</h3>
                <p className="olm-mem-desc">
                  {item.description || `${album.place} memory with its saved calendar date.`}
                </p>
                <div className="olm-mem-chip">
                  <time>{item.date?.slice(5)}</time>
                  <strong>{item.mood || album.place}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}