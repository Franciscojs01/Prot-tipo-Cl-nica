import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Relatorios(){
  const api = useAppState()
  const [reportType, setReportType] = useState('financeiro')
  const [periodFilter, setPeriodFilter] = useState('mes')

  const appointments = api.state.appointments || []
  const patients = api.state.patients || []
  const employees = api.state.employees || []
  const payroll = api.state.payroll || []

  // Calcular período
  function getFilteredAppointments(){
    const now = new Date()
    let startDate = new Date()

    if (periodFilter === 'semana') {
      startDate.setDate(now.getDate() - 7)
    } else if (periodFilter === 'mes') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (periodFilter === 'trimestre') {
      startDate.setMonth(now.getMonth() - 3)
    } else if (periodFilter === 'ano') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    return appointments.filter(a => new Date(a.date) >= startDate)
  }

  const filteredAppts = getFilteredAppointments()

  // Totais por data
  const totalsByDate = filteredAppts.reduce((acc,a)=>{
    if (!a.date) return acc
    acc[a.date] = (acc[a.date]||0) + (a.value||0)
    return acc
  }, {})
  const dates = Object.keys(totalsByDate).sort().reverse()
  const grandTotal = filteredAppts.reduce((s,a) => s + (a.value||0), 0)

  // Totais por serviço
  const totalsByService = filteredAppts.reduce((acc,a)=>{
    if (!a.service) return acc
    acc[a.service] = (acc[a.service]||0) + (a.value||0)
    return acc
  }, {})

  // Totais por funcionário (baseado nos prontuários)
  const medicalRecords = api.state.medicalRecords || []
  const recordsByEmployee = medicalRecords.reduce((acc, r) => {
    if (r.employeeId) {
      acc[r.employeeId] = (acc[r.employeeId]||0) + 1
    }
    return acc
  }, {})

  // Pacientes mais frequentes
  const appointmentsByPatient = filteredAppts.reduce((acc,a)=>{
    if (!a.patientId) return acc
    acc[a.patientId] = {
      count: (acc[a.patientId]?.count||0) + 1,
      total: (acc[a.patientId]?.total||0) + (a.value||0)
    }
    return acc
  }, {})
  const topPatients = Object.entries(appointmentsByPatient)
    .map(([id, data]) => {
      const patient = patients.find(p => p.id === id)
      return { ...data, patient }
    })
    .filter(p => p.patient)
    .sort((a,b) => b.total - a.total)
    .slice(0, 10)

  // Resumo de folha de pagamento
  const payrollSummary = payroll.reduce((acc, p) => {
    acc.total += p.netSalary || 0
    if (p.status === 'pago') acc.paid += p.netSalary || 0
    if (p.status !== 'pago') acc.pending += p.netSalary || 0
    return acc
  }, { total: 0, paid: 0, pending: 0 })

  const serviceColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

  return (
    <div>
      <h2 className="page-title">Relatórios</h2>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Tipo de Relatório</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: 'auto' }}>
              <option value="financeiro">Financeiro</option>
              <option value="pacientes">Pacientes</option>
              <option value="funcionarios">Funcionários</option>
              <option value="folhaPagamento">Folha de Pagamento</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Período</label>
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Relatório Financeiro */}
      {reportType === 'financeiro' && (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card-dark">
              <div className="stats-label">Receita Total</div>
              <div className="stats-value">R$ {grandTotal.toFixed(2)}</div>
            </div>
            <div className="card-dark">
              <div className="stats-label">Atendimentos</div>
              <div className="stats-value">{filteredAppts.length}</div>
            </div>
            <div className="card-dark">
              <div className="stats-label">Ticket Médio</div>
              <div className="stats-value">R$ {filteredAppts.length ? (grandTotal / filteredAppts.length).toFixed(2) : '0.00'}</div>
            </div>
          </div>

          {/* Gráfico de receita por serviço */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Receita por Serviço</h3>
            {Object.keys(totalsByService).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(totalsByService).sort((a,b) => b[1] - a[1]).map(([service, value], i) => {
                  const maxVal = Math.max(...Object.values(totalsByService))
                  const pct = (value / maxVal) * 100
                  return (
                    <div key={service}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{service}</span>
                        <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: 600 }}>R$ {value.toFixed(2)}</span>
                      </div>
                      <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: serviceColors[i % serviceColors.length], borderRadius: '6px', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: '#64748b', padding: '1rem 0' }}>Sem dados disponíveis</div>
            )}
          </div>

          {/* Receita por dia */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Receita por Dia</h3>
            {dates.length ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
        </>
      )}

      {/* Relatório de Pacientes */}
      {reportType === 'pacientes' && (
        <>
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card-dark">
              <div className="stats-label">Total de Pacientes</div>
              <div className="stats-value">{patients.length}</div>
            </div>
            <div className="card-dark">
              <div className="stats-label">Atendimentos no Período</div>
              <div className="stats-value">{filteredAppts.length}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Top 10 Pacientes (por valor)</h3>
            {topPatients.length ? (
              <div>
                {topPatients.map((item, i) => (
                  <div key={item.patient.id} className="list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.patient.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.count} atendimentos</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0d5c4a', fontSize: '1.1rem' }}>R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', padding: '1rem 0' }}>Sem dados disponíveis</div>
            )}
          </div>
        </>
      )}

      {/* Relatório de Funcionários */}
      {reportType === 'funcionarios' && (
        <>
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card-dark">
              <div className="stats-label">Total de Funcionários</div>
              <div className="stats-value">{employees.length}</div>
            </div>
            <div className="card-dark">
              <div className="stats-label">Prontuários Registrados</div>
              <div className="stats-value">{medicalRecords.length}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Atendimentos por Funcionário</h3>
            {employees.length ? (
              <div>
                {employees.map(emp => {
                  const recordCount = recordsByEmployee[emp.id] || 0
                  const linkedPatients = (emp.patients || []).length
                  return (
                    <div key={emp.id} className="list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.role} • {linkedPatients} pacientes vinculados</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.25rem' }}>{recordCount}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>prontuários</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: '#64748b', padding: '1rem 0' }}>Sem funcionários cadastrados</div>
            )}
          </div>
        </>
      )}

      {/* Relatório de Folha de Pagamento */}
      {reportType === 'folhaPagamento' && (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card-dark">
              <div className="stats-label">Total Geral</div>
              <div className="stats-value">R$ {payrollSummary.total.toFixed(2)}</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: 'none' }}>
              <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>Total Pago</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#047857', lineHeight: 1.2 }}>R$ {payrollSummary.paid.toFixed(2)}</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>Pendente</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#b45309', lineHeight: 1.2 }}>R$ {payrollSummary.pending.toFixed(2)}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Histórico de Pagamentos</h3>
            {payroll.length ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {payroll.slice().sort((a,b) => b.month.localeCompare(a.month)).map(p => {
                  const emp = employees.find(e => e.id === p.employeeId)
                  return (
                    <div key={p.id} className="list-item">
                      <div>
                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{emp ? emp.name : 'Funcionário removido'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {p.month} • {p.status}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: p.status === 'pago' ? '#065f46' : '#b45309', fontSize: '1.1rem' }}>R$ {(p.netSalary||0).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: '#64748b', padding: '1rem 0' }}>Sem dados de pagamento</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
