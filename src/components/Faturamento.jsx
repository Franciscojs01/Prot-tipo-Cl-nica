import React from 'react'
import { useAppState } from '../state.jsx'

export default function Faturamento(){
  const api = useAppState()
  const entries = api.state.appointments.filter(a => a.value && a.value > 0)
  const total = entries.reduce((s,a) => s + (a.value||0), 0)

  return (
    <div>
      <h2 className="page-title">Faturamento</h2>

      <div className="card-dark" style={{ marginBottom: '1.5rem' }}>
        <div className="stats-label">Receita Total</div>
        <div className="stats-value">R$ {total.toFixed(2)}</div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Histórico de Lançamentos</h3>
        {entries.length ? (
          <div>
            {entries.slice().reverse().map(a => {
              const p = api.state.patients.find(x => x.id === a.patientId)
              return (
                <div key={a.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{p ? p.fullName : 'Paciente removido'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{a.service} • {a.date} às {a.time}</div>
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
