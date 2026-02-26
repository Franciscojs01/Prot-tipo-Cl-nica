import React from 'react'
import { useAppState } from '../state.jsx'

export default function Sidebar({ currentView, onNavigate }){
  const api = useAppState()
  const role = api.state.userRole
  const user = api.state.currentUser

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Espaço Reabilita</h2>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Perfil: <span style={{ color: '#10b981' }}>{role}</span>
        </div>
        {user && (
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{user.name}</span>
            <button
              onClick={() => api.logout()}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#dc2626', color: 'white' }}
            >
              Sair
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {role === 'gestor' ? (
          <>
            <button onClick={() => onNavigate('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>
              Dashboard Financeiro
            </button>
            <button onClick={() => onNavigate('faturamento')} className={currentView === 'faturamento' ? 'active' : ''}>
              Faturamento
            </button>
            <button onClick={() => onNavigate('relatorios')} className={currentView === 'relatorios' ? 'active' : ''}>
              Relatórios
            </button>
            <button onClick={() => onNavigate('servicos')} className={currentView === 'servicos' ? 'active' : ''}>
              Tabela de Serviços
            </button>
            <button onClick={() => onNavigate('usuarios')} className={currentView === 'usuarios' ? 'active' : ''}>
              Gestão de Usuários
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('agenda')} className={currentView === 'agenda' ? 'active' : ''}>
              Agenda de Pacientes
            </button>
            <button onClick={() => onNavigate('pacientes')} className={currentView === 'pacientes' ? 'active' : ''}>
              Cadastro de Pacientes
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.7 }}>Trocar perfil:</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => api.setUserRole('gestor')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              background: role === 'gestor' ? '#10b981' : 'transparent',
              color: role === 'gestor' ? 'white' : '#eafaf1'
            }}
          >
            Gestor
          </button>
          <button
            onClick={() => api.setUserRole('recepcao')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              background: role === 'recepcao' ? '#10b981' : 'transparent',
              color: role === 'recepcao' ? 'white' : '#eafaf1'
            }}
          >
            Recepção
          </button>
        </div>
      </div>
    </aside>
  )
}
