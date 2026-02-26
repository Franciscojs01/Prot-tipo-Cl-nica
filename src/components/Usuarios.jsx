import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Usuarios(){
  const api = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('recepcao')

  const roleLabels = {
    gestor: 'Gestor',
    recepcao: 'Recepção',
    funcionario: 'Funcionário'
  }

  const roleBadges = {
    gestor: 'badge-confirmed',
    recepcao: 'badge-scheduled',
    funcionario: 'badge-inprogress'
  }

  function addUser(e){
    e.preventDefault()
    const user = { name, email, password, role }
    if (api.registerUser) api.registerUser(user)
    setName(''); setEmail(''); setPassword('')
  }

  return (
    <div>
      <h2 className="page-title">Gestão de Usuários</h2>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Usuários Cadastrados</h3>
        {api.state.users && api.state.users.length ? (
          <div>
            {api.state.users.map(u => (
              <div key={u.id} className="list-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{u.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{u.email}</div>
                </div>
                <span className={`badge ${roleBadges[u.role] || 'badge-scheduled'}`}>
                  {roleLabels[u.role] || u.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#64748b', padding: '1rem 0' }}>Nenhum usuário cadastrado</div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Adicionar Novo Usuário</h3>
        <form onSubmit={addUser}>
          <div className="grid-2">
            <div className="form-group">
              <label>Nome completo</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do usuário" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Senha</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>Tipo de acesso</label>
              <select value={role} onChange={e=>setRole(e.target.value)}>
                <option value="recepcao">Recepção</option>
                <option value="funcionario">Funcionário</option>
                <option value="gestor">Gestor</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '0.75rem', background: '#f0fdf9', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', color: '#065f46' }}>
            💡 <strong>Dica:</strong> Após criar um usuário do tipo "Funcionário", vá em <strong>Funcionários</strong> e vincule o usuário ao cadastro do funcionário para que ele tenha acesso ao seu perfil.
          </div>
          <button type="submit" className="bg-medical-green">
            Adicionar Usuário
          </button>
        </form>
      </div>
    </div>
  )
}
