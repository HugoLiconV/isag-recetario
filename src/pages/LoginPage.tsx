import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-page__form" onSubmit={handleSubmit}>
        <h1 className="login-page__title">Iniciar sesión</h1>

        {error && <div className="login-page__error">{error}</div>}

        <label className="login-page__label">
          Email
          <input
            className="login-page__input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="login-page__label">
          Contraseña
          <input
            className="login-page__input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button
          className="login-page__submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
