import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Register({ onCancel }){
  const api = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('recepcao')
  const [error, setError] = useState(null)

  function submit(e){
    e.preventDefault()
    const res = api.registerUser({ name, email, password, role })
    if (!res.ok) return setError(res.message)
  }

  return (
    <div className="auth-card">
      <h2>Criar Conta — Espaço Reabilita</h2>
      {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Nome completo</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            required
          />
        </div>
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
        <div className="form-group">
          <label>Tipo de acesso</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="recepcao">Recepção</option>
            <option value="gestor">Gestor</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" className="bg-medical-green" style={{ width: '100%' }}>
            Criar conta
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ width: '100%', background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}
          >
            Voltar ao login
          </button>
        </div>
      </form>
    </div>
  )
}
