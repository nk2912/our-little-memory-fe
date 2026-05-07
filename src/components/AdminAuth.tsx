import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiRequest } from '../lib/api'
import type { User } from '../types'

type Props = {
  onAuthed: (token: string, user: User) => void
}

export function AdminAuth({ onAuthed }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)

  const switchMode = (next: 'login' | 'register') => {
    if (next === mode) return
    setError('')
    setMode(next)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const body =
      mode === 'register'
        ? { name: form.get('name'), email: form.get('email'), password: form.get('password') }
        : { email: form.get('email'), password: form.get('password') }

    try {
      const data = await apiRequest<{ token: string; user: User }>(
        mode === 'register' ? '/register' : '/login',
        '',
        { method: 'POST', body: JSON.stringify(body) }
      )
      localStorage.setItem('olm_token', data.token)
      setExiting(true)
      setTimeout(() => onAuthed(data.token, data.user), 600)
    } catch {
      setError('Authentication failed. Check backend server and credentials.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-shell {
          position: fixed;
          inset: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Syne', system-ui, sans-serif;
          overflow: hidden;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .auth-shell.exiting {
          opacity: 0;
          transform: scale(1.02);
          pointer-events: none;
        }

        /* ── Left panel ── */
        .auth-left {
          background: #0f0e0d;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 52px;
          position: relative;
          overflow: hidden;
          animation: slideInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .auth-left::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 420px; height: 420px;
          border-radius: 50%;
          border: 0.5px solid rgba(184, 137, 58, 0.1);
          animation: rotateSlow 24s linear infinite;
          transform-origin: center center;
          pointer-events: none;
        }

        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -140px; left: -80px;
          width: 480px; height: 480px;
          border-radius: 50%;
          border: 0.5px solid rgba(184, 137, 58, 0.06);
          animation: rotateSlow 36s linear infinite reverse;
          transform-origin: center center;
          pointer-events: none;
        }

        @keyframes rotateSlow {
          to { transform: rotate(360deg); }
        }

        .auth-left-inner-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 260px; height: 260px;
          border-radius: 50%;
          border: 0.5px solid rgba(184, 137, 58, 0.05);
          transform: translate(-50%, -50%);
          animation: rotateSlow 18s linear infinite;
          pointer-events: none;
        }

        .auth-left-edge {
          position: absolute;
          top: 0; right: 0;
          width: 1px; height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(184, 137, 58, 0.35) 30%,
            rgba(212, 168, 85, 0.55) 50%,
            rgba(184, 137, 58, 0.35) 70%,
            transparent 100%
          );
          animation: shimmer 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        .auth-brand {
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .auth-brand-logo {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 30px;
          color: #d4a855;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .auth-brand-sub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .auth-hero {
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .auth-hero-eyebrow {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #b8893a;
          font-family: 'DM Mono', monospace;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .auth-hero-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px; height: 0.5px;
          background: #b8893a;
        }

        .auth-hero-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(38px, 4vw, 54px);
          line-height: 1.02;
          color: #f7f4ef;
          font-style: italic;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .auth-hero-title em {
          color: #d4a855;
          font-style: italic;
        }

        .auth-hero-desc {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.35);
          line-height: 1.75;
          max-width: 280px;
        }

        .auth-stats {
          display: flex;
          gap: 28px;
          align-items: center;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s 0.35s ease both;
        }

        .auth-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-stat-val {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          color: #d4a855;
          line-height: 1;
          font-style: italic;
        }

        .auth-stat-label {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.22);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .auth-stat-divider {
          width: 0.5px;
          height: 36px;
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-footer-meta {
          font-size: 9.5px;
          color: rgba(255, 255, 255, 0.15);
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        /* ── Right panel ── */
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #f7f4ef;
          position: relative;
          overflow: hidden;
          animation: slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .auth-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(184, 137, 58, 0.11) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-form-head {
          margin-bottom: 30px;
        }

        .auth-form-eyebrow {
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #9e998f;
          font-family: 'DM Mono', monospace;
          margin-bottom: 7px;
        }

        .auth-form-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 32px;
          color: #0f0e0d;
          font-style: italic;
          letter-spacing: -0.8px;
          line-height: 1.08;
        }

        /* ── Mode toggle ── */
        .auth-segmented {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #ede9e0;
          border-radius: 11px;
          padding: 3px;
          margin-bottom: 26px;
          position: relative;
        }

        .auth-seg-indicator {
          position: absolute;
          top: 3px; bottom: 3px; left: 3px;
          width: calc(50% - 3px);
          background: #0f0e0d;
          border-radius: 9px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.22);
          pointer-events: none;
        }

        .auth-seg-indicator.register {
          transform: translateX(calc(100% + 3px));
        }

        .auth-seg-btn {
          background: none;
          border: none;
          padding: 10px 0;
          border-radius: 9px;
          cursor: pointer;
          font-size: 12.5px;
          font-family: 'Syne', system-ui, sans-serif;
          font-weight: 500;
          color: #7a756c;
          transition: color 0.2s ease;
          letter-spacing: 0.2px;
          position: relative;
          z-index: 1;
        }

        .auth-seg-btn.active { color: #d4a855; }

        /* ── Name field animated reveal ── */
        .auth-name-field {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(-6px);
          transition:
            max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.28s ease,
            transform 0.28s ease,
            margin-bottom 0.28s ease;
          margin-bottom: 0;
        }

        .auth-name-field.visible {
          max-height: 88px;
          opacity: 1;
          transform: translateY(0);
          margin-bottom: 13px;
        }

        /* ── Fields ── */
        .auth-field { margin-bottom: 13px; }

        .auth-field label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #7a756c;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
          margin-bottom: 6px;
        }

        .auth-field input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e4dfd4;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13.5px;
          font-family: 'Syne', system-ui, sans-serif;
          color: #0f0e0d;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
        }

        .auth-field input::placeholder { color: #b4b2a9; }

        .auth-field input:focus {
          border-color: #b8893a;
          box-shadow: 0 0 0 3.5px rgba(184, 137, 58, 0.12);
          transform: translateY(-1px);
        }

        /* ── Error ── */
        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #fcebeb;
          border: 0.5px solid #f09595;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 14px;
          font-size: 12.5px;
          color: #a32d2d;
          line-height: 1.5;
          animation: shakeIn 0.32s ease both;
        }

        @keyframes shakeIn {
          0%   { opacity: 0; transform: translateX(-8px); }
          40%  { transform: translateX(6px); }
          70%  { transform: translateX(-3px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .auth-error-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }

        /* ── Submit ── */
        .auth-submit {
          width: 100%;
          background: #0f0e0d;
          color: rgba(255, 255, 255, 0.82);
          border: none;
          padding: 14px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13.5px;
          font-family: 'Syne', system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.4px;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 4px;
        }

        .auth-submit:hover:not(:disabled) {
          background: #b8893a;
          color: #0f0e0d;
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(184, 137, 58, 0.28);
        }

        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(184, 137, 58, 0.18);
        }

        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-spinner {
          width: 15px; height: 15px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-top-color: rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
        }

        .auth-submit:hover:not(:disabled) .auth-spinner {
          border-color: rgba(15, 14, 13, 0.15);
          border-top-color: #0f0e0d;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        }

        .auth-divider-line { flex: 1; height: 0.5px; background: #e4dfd4; }

        .auth-divider-text {
          font-size: 10px;
          color: #9e998f;
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-shell { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 40px 28px; }
        }
      `}</style>

      <div className={`auth-shell${exiting ? ' exiting' : ''}`}>

        {/* ── Left decorative panel ── */}
        <div className="auth-left">
          <div className="auth-left-inner-ring" />
          <div className="auth-left-edge" />

          <div className="auth-brand">
            <div className="auth-brand-logo">OLM</div>
            <div className="auth-brand-sub">Memory Archive</div>
          </div>

          <div className="auth-hero">
            <div className="auth-hero-eyebrow">Admin access</div>
            <h1 className="auth-hero-title">
              Your <em>life,</em><br />
              remembered.
            </h1>
            <p className="auth-hero-desc">
              Manage places, memories, routines, and the dates that matter most — all in one quiet corner of the web.
            </p>
          </div>

          <div className="auth-stats">
            <div className="auth-stat">
              <span className="auth-stat-val">∞</span>
              <span className="auth-stat-label">Memories</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-val">01</span>
              <span className="auth-stat-label">Archive</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-val">∀</span>
              <span className="auth-stat-label">Places</span>
            </div>
          </div>

          <div className="auth-footer-meta">
            OLM · Memory Manager · {new Date().getFullYear()}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-head">
              <div className="auth-form-eyebrow">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </div>
              <h2 className="auth-form-title">
                {mode === 'login' ? 'Sign in to continue' : 'Start your archive'}
              </h2>
            </div>

            {/* Sliding pill toggle */}
            <div className="auth-segmented" role="group" aria-label="Authentication mode">
              <div className={`auth-seg-indicator${mode === 'register' ? ' register' : ''}`} />
              <button
                type="button"
                className={`auth-seg-btn${mode === 'login' ? ' active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-seg-btn${mode === 'register' ? ' active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} noValidate>
              {/* Animated name field */}
              <div className={`auth-name-field${mode === 'register' ? ' visible' : ''}`}>
                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    required={mode === 'register'}
                    tabIndex={mode === 'register' ? 0 : -1}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete={mode === 'login' ? 'username' : 'email'}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <span className="auth-error-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <span className="auth-spinner" aria-hidden="true" />}
                {loading
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign in' : 'Create account')}
              </button>

              <div className="auth-divider" aria-hidden="true">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">
                  {mode === 'login' ? 'No account yet?' : 'Already have one?'}
                </span>
                <span className="auth-divider-line" />
              </div>
            </form>
          </div>
        </div>

      </div>
    </>
  )
}