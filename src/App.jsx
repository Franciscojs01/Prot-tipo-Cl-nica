import React, { useState, useEffect } from 'react'
import StateProvider, { useAppState } from './state.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Agenda from './components/Agenda.jsx'
import Pacientes from './components/Pacientes.jsx'
import Faturamento from './components/Faturamento.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Relatorios from './components/Relatorios.jsx'
import Usuarios from './components/Usuarios.jsx'
import Servicos from './components/Servicos.jsx'
import Funcionarios from './components/Funcionarios.jsx'
import Prontuarios from './components/Prontuarios.jsx'
import FolhaPagamento from './components/FolhaPagamento.jsx'
import PerfilFuncionario from './components/PerfilFuncionario.jsx'

function AppShell(){
  const [view, setView] = useState(() => window.location.hash.replace('#','') || 'agenda')

  useEffect(() => {
    function onHash() { setView(window.location.hash.replace('#','') || 'agenda') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar currentView={view} onNavigate={(v) => { window.location.hash = `#${v}` }} />
      <main className="main-content">
        <div className="content-wrapper">
          {view === 'dashboard' && <Dashboard />}
          {view === 'agenda' && <Agenda />}
          {view === 'pacientes' && <Pacientes />}
          {view === 'faturamento' && <Faturamento />}
          {view === 'relatorios' && <Relatorios />}
          {view === 'usuarios' && <Usuarios />}
          {view === 'servicos' && <Servicos />}
          {view === 'funcionarios' && <Funcionarios />}
          {view === 'prontuarios' && <Prontuarios />}
          {view === 'folhapagamento' && <FolhaPagamento />}
          {view === 'meuperfil' && <PerfilFuncionario />}
        </div>
      </main>
    </div>
  )
}

export default function App(){
  return (
    <StateProvider>
      <AuthGate />
    </StateProvider>
  )
}

function AuthGate(){
  const api = useAppState()
  const user = api.state.currentUser
  const [mode, setMode] = useState('login')

  if (!user) {
    return (
      <div className="auth-container">
        {mode === 'login' ? (
          <Login onRegister={() => setMode('register')} />
        ) : (
          <Register onCancel={() => setMode('login')} />
        )}
      </div>
    )
  }

  return <AppShell />
}
