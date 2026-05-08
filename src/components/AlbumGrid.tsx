import { useEffect } from 'react'
import type { VisitAlbum } from '../types'

type Props = {
  albums: VisitAlbum[]
  onSelect: (album: VisitAlbum) => void
}

const BG_CLASSES = ['olm-c1', 'olm-c2', 'olm-c3', 'olm-c4', 'olm-c5', 'olm-c6']

export function AlbumGrid({ albums, onSelect }: Props) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>('.olm-card-3d').forEach((card) => {
        const r = card.getBoundingClientRect()
        if (r.width === 0) return
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = (e.clientX - cx) / r.width
        const dy = (e.clientY - cy) / r.height
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.9) {
          card.style.transform = `perspective(1000px) rotateX(${-dy * 12}deg) rotateY(${dx * 12}deg) translateZ(8px)`
        } else {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)'
        }
      })
    }

    const handleMouseLeave = () => {
      document.querySelectorAll<HTMLElement>('.olm-card-3d').forEach((card) => {
        card.style.transform = ''
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      <style>{`
        .olm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          perspective: 1200px;
        }

        .olm-card-3d {
          position: relative;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          text-align: left;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          border-radius: 18px;
          overflow: hidden;
          opacity: 0;
          animation: olmCardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .olm-card-3d:first-child {
          grid-row: span 2;
        }

        .olm-card-3d:nth-child(1) { animation-delay: 0.05s; }
        .olm-card-3d:nth-child(2) { animation-delay: 0.15s; }
        .olm-card-3d:nth-child(3) { animation-delay: 0.25s; }
        .olm-card-3d:nth-child(4) { animation-delay: 0.35s; }
        .olm-card-3d:nth-child(5) { animation-delay: 0.45s; }
        .olm-card-3d:nth-child(6) { animation-delay: 0.55s; }

        @keyframes olmCardReveal {
          from { opacity: 0; transform: translateY(40px) rotateX(8deg); }
          to   { opacity: 1; transform: translateY(0) rotateX(0); }
        }

        .olm-card-face {
          width: 100%;
          height: 100%;
          min-height: 320px;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          border: 0.5px solid rgba(255, 255, 255, 0.06);
        }

        .olm-card-3d:first-child .olm-card-face {
          min-height: 664px;
        }

        .olm-card-bg {
          position: absolute;
          inset: 0;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .olm-card-3d:hover .olm-card-bg { transform: scale(1.06); }

        /* Background gradients per card */
        .olm-c1 { background: radial-gradient(ellipse at 30% 40%, #2d4a3e, #0e1e1a); }
        .olm-c2 { background: radial-gradient(ellipse at 70% 30%, #3a2810, #140d05); }
        .olm-c3 { background: radial-gradient(ellipse at 50% 60%, #1e1a3a, #0a0810); }
        .olm-c4 { background: radial-gradient(ellipse at 40% 50%, #1a2e1a, #080f08); }
        .olm-c5 { background: radial-gradient(ellipse at 60% 40%, #2e1a2e, #0f080f); }
        .olm-c6 { background: radial-gradient(ellipse at 35% 55%, #1a2030, #080a14); }

        /* Diagonal pattern overlay */
        .olm-card-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            repeating-linear-gradient(45deg, rgba(212,167,58,0.6) 0px, rgba(212,167,58,0.6) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(-45deg, rgba(212,167,58,0.3) 0px, rgba(212,167,58,0.3) 1px, transparent 1px, transparent 40px);
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .olm-card-3d:hover .olm-card-pattern { opacity: 0.16; }

        /* Dark veil */
        .olm-card-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
        }

        /* Gold orb top-right */
        .olm-card-orb {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,167,58,0.18) 0%, transparent 70%);
          transition: transform 0.5s, opacity 0.5s;
          pointer-events: none;
        }

        .olm-card-3d:hover .olm-card-orb { transform: scale(1.4); }

        /* Glass shine */
        .olm-card-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .olm-card-3d:hover .olm-card-shine { opacity: 1; }

        /* Gold edge highlight */
        .olm-card-edge {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid transparent;
          background:
            linear-gradient(rgba(8,7,10,0), rgba(8,7,10,0)) padding-box,
            linear-gradient(135deg, rgba(212,167,58,0.0), rgba(212,167,58,0.38), rgba(212,167,58,0.0)) border-box;
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .olm-card-3d:hover .olm-card-edge { opacity: 1; }

        /* Card content */
        .olm-card-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
        }

        .olm-card-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: 14px;
          color: rgba(212, 167, 58, 0.6);
          font-weight: 300;
          letter-spacing: 1px;
          background: rgba(8, 7, 10, 0.4);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 20px;
          display: inline-block;
          width: fit-content;
          border: 0.5px solid rgba(212, 167, 58, 0.15);
        }

        .olm-card-place {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(240, 197, 96, 0.75);
          margin-bottom: 8px;
        }

        .olm-card-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px;
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.5px;
          color: #f5efe0;
          margin-bottom: 14px;
        }

        .olm-card-3d:first-child .olm-card-title {
          font-size: 34px;
          letter-spacing: -1px;
        }

        .olm-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .olm-card-count {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(245, 239, 224, 0.3);
        }

        .olm-card-arrow {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(212, 167, 58, 0.1);
          border: 0.5px solid rgba(212, 167, 58, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #f0c560;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          flex-shrink: 0;
        }

        .olm-card-3d:hover .olm-card-arrow {
          background: #f0c560;
          color: #08070a;
          border-color: #f0c560;
          transform: rotate(-45deg);
        }

        @media (max-width: 768px) {
          .olm-grid { grid-template-columns: 1fr; }
          .olm-card-3d:first-child { grid-row: span 1; }
          .olm-card-3d:first-child .olm-card-face { min-height: 320px; }
          .olm-card-3d:first-child .olm-card-title { font-size: 26px; }
        }
      `}</style>

      <div className="olm-grid" aria-label="Memory albums">
        {albums.map((album, index) => (
          <button
            key={album.id}
            className="olm-card-3d"
            type="button"
            onClick={() => onSelect(album)}
            aria-label={`Open ${album.title}`}
          >
            <div className="olm-card-face">
              <div
                className={`olm-card-bg ${BG_CLASSES[index % BG_CLASSES.length]}`}
                style={album.image ? { backgroundImage: `url(${album.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              />
              <div className="olm-card-pattern" />
              <div className="olm-card-veil" />
              <div className="olm-card-orb" />
              <div className="olm-card-shine" />
              <div className="olm-card-edge" />
              <div className="olm-card-content">
                <span className="olm-card-num">0{index + 1}</span>
                <div>
                  <p className="olm-card-place">{album.place}</p>
                  <h3 className="olm-card-title">{album.title}</h3>
                  <div className="olm-card-meta">
                    <span className="olm-card-count">{album.memories.length} memories</span>
                    <span className="olm-card-arrow">↗</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}