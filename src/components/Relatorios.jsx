import React from 'react'
import { useAppState } from '../state.jsx'

export default function Relatorios(){
  const api = useAppState()
  const totalsByDate = api.state.appointments.reduce((acc,a)=>{
    if (!a.date) return acc
    acc[a.date] = (acc[a.date]||0) + (a.value||0)
    return acc
  }, {})
  const dates = Object.keys(totalsByDate).sort().reverse()
  const grandTotal = dates.reduce((s,d) => s + totalsByDate[d], 0)

  return (
    <div>
      <h2 className="page-title">Relatórios</h2>

      <div className="card-dark" style={{ marginBottom: '1.5rem' }}>
        <div className="stats-label">Total Geral</div>
        <div className="stats-value">R$ {grandTotal.toFixed(2)}</div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Receita por Dia</h3>
        {dates.length ? (
          <div>
            {dates.map(d => (
              <div key={d} className="list-item">
                <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{d}</span>
                <span style={{ fontWeight: 700, color: '#0d5c4a', fontSize: '1.1rem' }}>R$ {totalsByDate[d].toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#64748b', padding: '1rem 0' }}>Sem dados disponíveis</div>
        )}
      </div>
    </div>
  )
}
