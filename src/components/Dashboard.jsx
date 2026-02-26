import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Dashboard(){
  const api = useAppState()
  const [chartPeriod, setChartPeriod] = useState('7days')

  const totalAppointments = api.state.appointments.length
  const totalPatients = api.state.patients.length
  const totalEmployees = (api.state.employees || []).length
  const revenue = api.state.appointments.reduce((s,a) => s + (a.value || 0), 0)
  const last = api.state.appointments.slice(-5).reverse()

  // Calcular dados para os gráficos
  const appointments = api.state.appointments || []
  const employees = api.state.employees || []
  const payroll = api.state.payroll || []

  // Receita por período
  function getRevenueByPeriod(){
    const now = new Date()
    let days = 7
    if (chartPeriod === '30days') days = 30
    if (chartPeriod === '90days') days = 90

    const data = []
    for (let i = days - 1; i >= 0; i--){
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0,10)
      const dayRevenue = appointments.filter(a => a.date === dateStr).reduce((s,a) => s + (a.value||0), 0)
      data.push({ date: dateStr, label: `${d.getDate()}/${d.getMonth()+1}`, value: dayRevenue })
    }
    return data
  }

  // Receita por serviço
  function getRevenueByService(){
    const services = {}
    appointments.forEach(a => {
      if (a.service && a.value) {
        services[a.service] = (services[a.service] || 0) + a.value
      }
    })
    return Object.entries(services).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  }

  // Status dos agendamentos
  function getAppointmentsByStatus(){
    const statuses = {}
    appointments.forEach(a => {
      const status = a.status || 'scheduled'
      statuses[status] = (statuses[status] || 0) + 1
    })
    return statuses
  }

  // Pagamentos do mês atual
  function getCurrentMonthPayroll(){
    const currentMonth = new Date().toISOString().slice(0,7)
    return payroll.filter(p => p.month === currentMonth)
  }

  const revenueData = getRevenueByPeriod()
  const serviceData = getRevenueByService()
  const statusData = getAppointmentsByStatus()
  const currentPayroll = getCurrentMonthPayroll()

  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1)
  const totalPayrollPaid = currentPayroll.filter(p => p.status === 'pago').reduce((s,p) => s + (p.netSalary||0), 0)
  const totalPayrollPending = currentPayroll.filter(p => p.status !== 'pago').reduce((s,p) => s + (p.netSalary||0), 0)

  const statusLabels = {
    scheduled: 'Aguardando',
    confirmed: 'Confirmado',
    'in-progress': 'Em Atendimento',
    completed: 'Finalizado',
    cancelled: 'Cancelado'
  }
  const statusColors = {
    scheduled: '#fbbf24',
    confirmed: '#3b82f6',
    'in-progress': '#a855f7',
    completed: '#10b981',
    cancelled: '#ef4444'
  }

  const serviceColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

  return (
    <div>
      <h2 className="page-title">Dashboard Financeiro</h2>

      {/* Cards de resumo */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card-dark">
          <div className="stats-label">Pacientes</div>
          <div className="stats-value">{totalPatients}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Funcionários</div>
          <div className="stats-value">{totalEmployees}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Receita Total</div>
          <div className="stats-value">R$ {revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Gráfico de Receita */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#0d3d32' }}>Receita por Período</h3>
          <select
            value={chartPeriod}
            onChange={e => setChartPeriod(e.target.value)}
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
          >
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
          </select>
        </div>

        {/* Gráfico de barras */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '0 1rem' }}>
          {revenueData.map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '40px',
                  background: d.value > 0 ? 'linear-gradient(180deg, #10b981 0%, #065f46 100%)' : '#e2e8f0',
                  borderRadius: '4px 4px 0 0',
                  height: `${Math.max((d.value / maxRevenue) * 160, 4)}px`,
                  transition: 'height 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                title={`${d.date}: R$ ${d.value.toFixed(2)}`}
              >
                {d.value > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.625rem',
                    color: '#065f46',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value.toFixed(0)}
                  </div>
                )}
              </div>
              {chartPeriod === '7days' && (
                <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap' }}>
                  {d.label}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          Total no período: <strong style={{ color: '#065f46' }}>R$ {revenueData.reduce((s,d) => s + d.value, 0).toFixed(2)}</strong>
        </div>
      </div>

      {/* Grid com gráficos menores */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Gráfico de pizza - Receita por Serviço */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Receita por Serviço</h3>
          {serviceData.length > 0 ? (
            <div>
              {/* Barras horizontais */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {serviceData.slice(0, 5).map((s, i) => {
                  const maxVal = serviceData[0].value
                  const pct = (s.value / maxVal) * 100
                  return (
                    <div key={s.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{s.name}</span>
                        <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: 600 }}>R$ {s.value.toFixed(2)}</span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: serviceColors[i % serviceColors.length],
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>Sem dados de serviços</div>
          )}
        </div>

        {/* Status dos Agendamentos */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Status dos Agendamentos</h3>
          {Object.keys(statusData).length > 0 ? (
            <div>
              {/* Donut chart visual representation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {(() => {
                      const total = Object.values(statusData).reduce((s,v) => s + v, 0)
                      let currentAngle = -90
                      const entries = Object.entries(statusData)
                      return entries.map(([status, count], i) => {
                        const pct = count / total
                        const angle = pct * 360
                        const startAngle = currentAngle
                        const endAngle = currentAngle + angle
                        currentAngle = endAngle

                        const startRad = (startAngle * Math.PI) / 180
                        const endRad = (endAngle * Math.PI) / 180
                        const largeArc = angle > 180 ? 1 : 0

                        const x1 = 60 + 50 * Math.cos(startRad)
                        const y1 = 60 + 50 * Math.sin(startRad)
                        const x2 = 60 + 50 * Math.cos(endRad)
                        const y2 = 60 + 50 * Math.sin(endRad)

                        return (
                          <path
                            key={status}
                            d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={statusColors[status] || '#94a3b8'}
                            stroke="white"
                            strokeWidth="2"
                          />
                        )
                      })
                    })()}
                    <circle cx="60" cy="60" r="30" fill="white" />
                    <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.25rem', fontWeight: 700, fill: '#0d3d32' }}>
                      {totalAppointments}
                    </text>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  {Object.entries(statusData).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: statusColors[status] || '#94a3b8' }} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{statusLabels[status] || status}</span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: 'auto' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>Sem agendamentos</div>
          )}
        </div>
      </div>

      {/* Resumo Folha de Pagamento */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Folha de Pagamento - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
        <div className="grid-3">
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>Total Pago</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857' }}>R$ {totalPayrollPaid.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>Pendente</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>R$ {totalPayrollPending.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Funcionários</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155' }}>{totalEmployees}</div>
          </div>
        </div>
      </div>

      {/* Últimos lançamentos */}
      <div className="card">
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
