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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const body =
      mode === 'register'
        ? { name: form.get('name'), email: form.get('email'), password: form.get('password') }
        : { email: form.get('email'), password: form.get('password') }

    try {
      const data = await apiRequest<{ token: string; user: User }>(mode === 'register' ? '/register' : '/login', '', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      localStorage.setItem('olm_token', data.token)
      onAuthed(data.token, data.user)
    } catch {
      setError('Authentication failed. Check backend server and credentials.')
    }
  }

  return (
    <form className="admin-auth" onSubmit={submit}>
      <div>
        <p className="eyebrow">Admin</p>
        <h1>Memory manager</h1>
      </div>
      <div className="segmented">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>
      {mode === 'register' && <input name="name" placeholder="Name" required />}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" minLength={8} required />
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
    </form>
  )
}
