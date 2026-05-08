import { useEffect, useMemo, useRef, useState } from 'react'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const collectionRef = useRef<HTMLElement>(null)

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

  /* ── Particle canvas ── */
  useEffect(() => {
    if (selected) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    interface Particle {
      x: number; y: number; r: number
      vx: number; vy: number; alpha: number; gold: boolean
    }

    let W = 0, H = 0
    let particles: Particle[] = []

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      particles = Array.from({ length: 130 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.5 + 0.1,
        gold: Math.random() > 0.55,
      }))
    }

    const drawOrbs = () => {
      const orbs = [
        { x: W * 0.15, y: H * 0.25, r: 200 },
        { x: W * 0.85, y: H * 0.6,  r: 260 },
        { x: W * 0.5,  y: H * 0.8,  r: 180 },
      ]
      orbs.forEach(({ x, y, r }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, 'rgba(212,167,58,0.05)')
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      })
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.strokeStyle = `rgba(212,167,58,${(1 - d / 120) * 0.07})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)
      drawOrbs()
      drawConnections()
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(212,167,58,${p.alpha})`
          : `rgba(245,239,224,${p.alpha * 0.35})`
        ctx.fill()
      })
      animFrameRef.current = requestAnimationFrame(loop)
    }

    resize()
    loop()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      ro.disconnect()
    }
  }, [selected])

  const albums = useMemo(() => createAlbums(memories, places), [memories, places])

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelect = (album: VisitAlbum) => {
    setSelected(album)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=Syne:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; background: #08070a; }

        body {
          font-family: 'Syne', system-ui, sans-serif;
          background: #08070a;
          color: #f5efe0;
          overflow-x: hidden;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,167,58,0.28); border-radius: 2px; }

        .olm-shell { min-height: 100vh; background: #08070a; }

        /* ── HERO ── */
        .olm-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 120px 48px 80px;
          overflow: hidden;
        }

        .olm-hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .olm-hero-content {
          position: relative;
          z-index: 2;
        }

        .olm-hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: #d4a73a;
          margin-bottom: 28px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          animation: olmRiseIn 1s 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }

        .olm-hero-eyebrow::before,
        .olm-hero-eyebrow::after {
          content: '';
          display: block;
          width: 32px;
          height: 0.5px;
          background: #d4a73a;
          opacity: 0.5;
        }

        .olm-hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(72px, 10vw, 140px);
          font-weight: 300;
          line-height: 0.88;
          letter-spacing: -5px;
          color: #f5efe0;
          margin-bottom: 32px;
          animation: olmRiseIn 1s 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }

        .olm-hero-title em {
          font-style: italic;
          color: #f0c560;
          display: block;
        }

        .olm-hero-desc {
          font-size: 15px;
          color: rgba(245,239,224,0.4);
          line-height: 1.8;
          max-width: 380px;
          margin: 0 auto 52px;
          animation: olmRiseIn 1s 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .olm-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #08070a;
          background: #f0c560;
          padding: 14px 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow:
            0 8px 32px rgba(212,167,58,0.35),
            0 2px 8px rgba(212,167,58,0.2),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          animation: olmRiseIn 1s 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }

        .olm-hero-cta:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 16px 48px rgba(212,167,58,0.45),
            0 4px 16px rgba(212,167,58,0.25);
        }

        .olm-hero-cta:active { transform: translateY(-1px) scale(1.01); }

        .olm-hero-scroll {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,239,224,0.18);
          animation: olmRiseIn 1s 0.9s ease both;
        }

        .olm-hero-scroll-line {
          width: 0.5px;
          height: 48px;
          background: linear-gradient(to bottom, rgba(212,167,58,0.4), transparent);
          animation: olmScrollPulse 2s ease-in-out infinite;
        }

        @keyframes olmScrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
          50%       { opacity: 1;   transform: scaleY(1); }
        }

        /* ── COLLECTION SECTION ── */
        .olm-collection {
          position: relative;
          padding: 80px 56px 100px;
          background: #08070a;
          overflow: hidden;
        }

        .olm-collection::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,167,58,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .olm-section-label {
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

        .olm-section-label::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: rgba(212,167,58,0.15);
        }

        .olm-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 4vw, 54px);
          font-weight: 300;
          letter-spacing: -2px;
          color: #f5efe0;
          margin-bottom: 64px;
        }

        .olm-section-title em {
          font-style: italic;
          color: #f0c560;
        }

        /* ── EMPTY STATE ── */
        .olm-empty {
          text-align: center;
          padding: 96px 40px;
          border: 0.5px dashed rgba(212,167,58,0.2);
          border-radius: 20px;
          background: rgba(212,167,58,0.02);
        }

        .olm-empty-ornament {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 64px;
          font-style: italic;
          color: rgba(212,167,58,0.15);
          margin-bottom: 20px;
          line-height: 1;
        }

        .olm-empty-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -0.8px;
          color: #f5efe0;
          margin-bottom: 12px;
        }

        .olm-empty-desc {
          font-size: 14px;
          color: rgba(245,239,224,0.35);
          line-height: 1.8;
          margin-bottom: 32px;
        }

        .olm-empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #f5efe0;
          padding: 12px 28px;
          border: 0.5px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          transition: all 0.25s;
        }

        .olm-empty-cta:hover {
          background: rgba(212,167,58,0.1);
          border-color: rgba(212,167,58,0.4);
          color: #f0c560;
        }

        /* ── FOOTER ── */
        .olm-footer {
          border-top: 0.5px solid rgba(255,255,255,0.04);
          padding: 28px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #08070a;
        }

        .olm-footer-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 14px;
          font-style: italic;
          color: rgba(245,239,224,0.18);
        }

        .olm-footer-meta {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(245,239,224,0.1);
        }

        @keyframes olmRiseIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .olm-hero { padding: 100px 24px 80px; }
          .olm-hero-title { letter-spacing: -3px; }
          .olm-collection { padding: 60px 20px 80px; }
          .olm-footer { padding: 24px 20px; flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <main className="olm-shell">
        <PublicHeader status={status} />

        {selected ? (
          <AlbumDetail album={selected} onBack={handleBack} />
        ) : (
          <>
            {/* ── Hero ── */}
            <section className="olm-hero">
              <canvas className="olm-hero-canvas" ref={canvasRef} />
              <div className="olm-hero-content">
                <p className="olm-hero-eyebrow">Memory archive</p>
                <h1 className="olm-hero-title">
                  Our
                  <em>Little Map</em>
                </h1>
                <p className="olm-hero-desc">
                  Browse saved places and memories as albums grouped by location — a private archive of moments.
                </p>
                <button className="olm-hero-cta" type="button" onClick={scrollToCollection}>
                  Explore albums ↓
                </button>
              </div>
              <div className="olm-hero-scroll">
                <span>scroll</span>
                <div className="olm-hero-scroll-line" />
              </div>
            </section>

            {/* ── Collection ── */}
            <section className="olm-collection" ref={collectionRef}>
              <p className="olm-section-label">Collection</p>
              <h2 className="olm-section-title">Place <em>albums</em></h2>

              {albums.length > 0 ? (
                <AlbumGrid albums={albums} onSelect={handleSelect} />
              ) : (
                <div className="olm-empty">
                  <div className="olm-empty-ornament">∅</div>
                  <h2 className="olm-empty-title">No albums yet</h2>
                  <p className="olm-empty-desc">
                    Create places and memories in admin, then return here.
                  </p>
                  <a className="olm-empty-cta" href="/admin">Open admin →</a>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="olm-footer">
          <span className="olm-footer-brand">Our Little Map · Memory Archive</span>
          <span className="olm-footer-meta">OLM · {new Date().getFullYear()}</span>
        </footer>
      </main>
    </>
  )
}