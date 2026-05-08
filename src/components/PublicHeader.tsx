export function PublicHeader({ status }: { status?: string }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=Syne:wght@400;500;700&display=swap');

        .olm-header {
          position: sticky;
          top: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 56px;
          height: 68px;
          background: rgba(8, 7, 10, 0.72);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 0.5px solid rgba(212, 167, 58, 0.12);
        }

        .olm-header-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
        }

        .olm-header-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1a1508, #3a2a08);
          border: 0.5px solid rgba(212, 167, 58, 0.35);
          display: grid;
          place-items: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          color: #f0c560;
          box-shadow:
            0 2px 16px rgba(212, 167, 58, 0.15),
            inset 0 1px 0 rgba(212, 167, 58, 0.1);
          flex-shrink: 0;
        }

        .olm-header-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 19px;
          font-weight: 400;
          color: #f5efe0;
          letter-spacing: -0.2px;
        }

        .olm-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .olm-header-pill {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #d4a73a;
          padding: 5px 14px;
          border: 0.5px solid rgba(212, 167, 58, 0.25);
          border-radius: 20px;
          background: rgba(212, 167, 58, 0.05);
        }

        .olm-header-admin {
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          color: rgba(245, 239, 224, 0.5);
          padding: 7px 18px;
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: color 0.22s, border-color 0.22s, background 0.22s;
          font-family: 'Syne', system-ui, sans-serif;
        }

        .olm-header-admin:hover {
          color: #f5efe0;
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.04);
        }

        @media (max-width: 640px) {
          .olm-header { padding: 0 20px; }
          .olm-header-pill { display: none; }
        }
      `}</style>

      <header className="olm-header">
        <a className="olm-header-brand" href="/">
          <div className="olm-header-badge">OLM</div>
          <span className="olm-header-name">Our Little Map</span>
        </a>
        <div className="olm-header-right">
          {status && <span className="olm-header-pill">{status}</span>}
          <a className="olm-header-admin" href="/admin">Admin</a>
        </div>
      </header>
    </>
  )
}