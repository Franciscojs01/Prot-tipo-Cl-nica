import React from 'react'
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const HOURS = Array.from({length: 12}, (_, i) => `${(i+7).toString().padStart(2, '0')}:00`) // 07:00 to 18:00
export default function AgendaCalendar({ appointments, startOfWeek, api, employees, handleStatusChange, isGlobal }) {
  const weekDays = Array.from({length: 7}, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })
  const formatYMD = (d) => d.toISOString().slice(0, 10)
  const apptMap = {}
  appointments.forEach(a => {
    if (!a.date || !a.time) return
    const d = a.date
    const h = a.time.split(':')[0]
    if (!apptMap[d]) apptMap[d] = {}
    if (!apptMap[d][h]) apptMap[d][h] = []
    apptMap[d][h].push(a)
  })
  Object.keys(apptMap).forEach(d => {
    Object.keys(apptMap[d]).forEach(h => {
      apptMap[d][h].sort((a,b) => a.time.localeCompare(b.time))
    })
  })
  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #e2e8f0', width: '60px', background: '#f1f5f9' }}>
              Hora
            </th>
            {weekDays.map(d => {
              const isToday = formatYMD(d) === formatYMD(new Date())
              return (
                <th key={formatYMD(d)} style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #e2e8f0', textAlign: 'center', background: isToday ? '#e0f2fe' : '#f8fafc' }}>
                  <div style={{ fontWeight: 'normal', color: isToday ? '#0284c7' : '#64748b' }}>{DAYS[d.getDay()]}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: isToday ? '#0369a1' : '#0f172a' }}>{d.getDate().toString().padStart(2, '0')}/{(d.getMonth()+1).toString().padStart(2, '0')}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hourStr => {
            const h = hourStr.split(':')[0]
            return (
              <tr key={hourStr}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#64748b', background: '#f8fafc' }}>
                  {hourStr}
                </td>
                {weekDays.map(d => {
                  const dStr = formatYMD(d)
                  const slotAppts = (apptMap[dStr] && apptMap[dStr][h]) || []
                  const isToday = dStr === formatYMD(new Date())
                  return (
                    <td key={dStr} style={{ padding: '0.4rem', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', height: '100px', width: '13%', background: isToday ? '#f0f9ff50' : 'transparent' }}>
                      {slotAppts.map(a => {
                        const p = (api.state.patients || []).find(x => x.id === a.patientId) || { fullName: 'Paciente removido', healthPlan: '' }
                        const emp = employees.find(x => x.id === a.employeeId)
                        const isCancelled = a.status === 'cancelled'
                        let bgColor = '#e0f2fe'
                        let borderColor = '#38bdf8'
                        if (isCancelled) { bgColor = '#fef2f2'; borderColor = '#f87171' }
                        else if (a.status === 'completed') { bgColor = '#dcfce7'; borderColor = '#4ade80' }
                        else if (a.status === 'in-progress') { bgColor = '#fef08a'; borderColor = '#eab308' }
                        return (
                          <div key={a.id} style={{
                            background: bgColor, borderLeft: `4px solid ${borderColor}`, borderRadius: '4px', padding: '0.4rem', marginBottom: '0.4rem', opacity: isCancelled ? 0.6 : 1, position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '2px', textDecoration: isCancelled ? 'line-through' : 'none', fontSize: '0.8rem' }} title={p.fullName}>
                              {a.time} - {p.fullName}
                            </div>
                            <div style={{ color: '#475569', fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{a.service || 'S/ serviço'}</span>
                            </div>
                            {isGlobal && emp && <div style={{ fontSize: '0.7rem', color: '#0369a1', marginTop: '2px' }}>👨‍⚕️ {emp.name.split(' ')[0]}</div>}
                            <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: `1px dashed ${borderColor}`, display: 'flex', justifyContent: 'space-between' }}>
                              <select 
                                value={a.status} 
                                onChange={(e) => handleStatusChange(a, e.target.value)}
                                style={{ fontSize: '0.65rem', padding: '0', border: 'none', background: 'transparent', width: '70px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                                disabled={isCancelled}
                                title="Alterar Status"
                              >
                                <option value="scheduled">Aguard.</option>
                                <option value="confirmed">Confir.</option>
                                <option value="in-progress">Em Atend.</option>
                                <option value="completed">Finaliz.</option>
                                {!isCancelled && <option value="cancelled">Cancelar</option>}
                              </select>
                            </div>
                          </div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
