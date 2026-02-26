import React from 'react'
import { useAppState } from '../state.jsx'

export default function Dashboard(){
  const api = useAppState()
  const totalAppointments = api.state.appointments.length
  const totalPatients = api.state.patients.length
  const revenue = api.state.appointments.reduce((s,a) => s + (a.value || 0), 0)
  const last = api.state.appointments.slice(-5).reverse()

  return (
    <div>
      <h2 className="page-title">Dashboard Financeiro</h2>

      <div className="grid-3">
        <div className="card-dark">
          <div className="stats-label">Pacientes</div>
          <div className="stats-value">{totalPatients}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Agendamentos</div>
          <div className="stats-value">{totalAppointments}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Receita Total</div>
          <div className="stats-value">R$ {revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Últimos Lançamentos</h3>
        {last.length ? (
          <div>
            {last.map(a => {
              const p = api.state.patients.find(x => x.id === a.patientId)
              return (
                <div key={a.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{p ? p.fullName : 'Paciente removido'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{a.service} • {a.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#0d5c4a', fontSize: '1.1rem' }}>R$ {(a.value||0).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: '#64748b', padding: '1rem 0' }}>Nenhum lançamento registrado</div>
        )}
      </div>
    </div>
  )
}
