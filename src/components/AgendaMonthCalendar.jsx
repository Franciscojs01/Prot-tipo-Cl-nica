import React from 'react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AgendaMonthCalendar({ appointments, selectedMonth, api, employees, handleStatusChange, isGlobal }) {
  // selectedMonth is YYYY-MM
  const yearStr = selectedMonth ? selectedMonth.slice(0, 4) : new Date().getFullYear().toString()
  const monthStr = selectedMonth && selectedMonth.length >= 7 ? selectedMonth.slice(5, 7) : (new Date().getMonth() + 1).toString()
  
  const year = parseInt(yearStr) || new Date().getFullYear()
  const month = (parseInt(monthStr) || (new Date().getMonth() + 1)) - 1
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const weeks = []
  let currentWeek = []
  
  for (let i = 0; i < startingDay; i++) {
    currentWeek.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  const formatYMD = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #cbd5e1', background: '#f1f5f9' }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#64748b', fontSize: '0.875rem' }}>
            {d}
          </div>
        ))}
      </div>
      <div>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wIdx < weeks.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
            {week.map((day, dIdx) => {
              if (day === null) {
                return <div key={dIdx} style={{ background: '#f8fafc', borderRight: dIdx < 6 ? '1px solid #e2e8f0' : 'none', minHeight: '120px' }}></div>
              }
              const dateStr = formatYMD(year, month, day)
              const dayAppts = appointments.filter(a => a.date === dateStr)
              const isToday = dateStr === today
              
              return (
                <div key={dIdx} style={{ 
                  borderRight: dIdx < 6 ? '1px solid #e2e8f0' : 'none', 
                  minHeight: '120px', 
                  padding: '0.5rem',
                  background: isToday ? '#f0f9ff50' : 'transparent'
                }}>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: isToday ? '#0284c7' : '#64748b', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: isToday ? '#e0f2fe' : 'transparent', 
                      borderRadius: '50%', 
                      width: '24px', 
                      height: '24px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>{day}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {dayAppts.slice(0, 4).map(a => {
                      const p = (api.state.patients || []).find(x => x.id === a.patientId) || { fullName: 'Paciente' }
                      const emp = employees.find(x => x.id === a.employeeId)
                      const isCancelled = a.status === 'cancelled'
                      let bgColor = '#e0f2fe'
                      let borderColor = '#38bdf8'
                      if (isCancelled) { bgColor = '#fef2f2'; borderColor = '#f87171' }
                      else if (a.status === 'completed') { bgColor = '#dcfce7'; borderColor = '#4ade80' }
                      else if (a.status === 'in-progress') { bgColor = '#fef08a'; borderColor = '#eab308' }
                      
                      return (
                        <div key={a.id} style={{
                          background: bgColor, borderLeft: `3px solid ${borderColor}`, borderRadius: '2px', padding: '0.25rem', fontSize: '0.7rem', opacity: isCancelled ? 0.6 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }} title={`${a.time} - ${p.fullName}`}>
                          <strong>{a.time}</strong> {p.fullName.split(' ')[0]}
                          {isGlobal && emp && ` • Dr(a). ${emp.name.split(' ')[0]}`}
                        </div>
                      )
                    })}
                    {dayAppts.length > 4 && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>
                        + {dayAppts.length - 4} agendamentos
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
