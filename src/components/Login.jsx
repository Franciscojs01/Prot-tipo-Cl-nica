import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Login({ onRegister }){
  const api = useAppState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  function submit(e){
    e.preventDefault()
    const res = api.loginUser(email, password)
    if (!res.ok) setError(res.message)
  }

  return (
    <div className="auth-card">
      <h2 style={{ color: '#02251f', textAlign: 'center', marginBottom: '1.5rem' }}>
        Entrar — Espaço Reabilita
      </h2>
      {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" className="bg-medical-green" style={{ width: '100%' }}>
            Entrar
          </button>
          <button
            type="button"
            onClick={onRegister}
            style={{ width: '100%', background: 'transparent', border: '2px solid #0d5c4a', color: '#0d5c4a' }}
          >
            Criar uma conta
          </button>
        </div>
      </form>
    </div>
  )
}
