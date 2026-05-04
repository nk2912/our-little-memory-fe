const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export async function apiRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    try {
      const json = JSON.parse(text) as { message?: string; errors?: Record<string, string[]> }
      const validation = json.errors ? Object.values(json.errors).flat().join(' ') : ''
      throw new Error(validation || json.message || `Request failed: ${response.status}`)
    } catch {
      throw new Error(text || `Request failed: ${response.status}`)
    }
  }

  return response.status === 204 ? ({} as T) : response.json()
}
