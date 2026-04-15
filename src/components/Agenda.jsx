import React, { useState } from 'react'
import { useAppState } from '../state.jsx'
import AgendaCalendar from './AgendaCalendar.jsx'
import AgendaMonthCalendar from './AgendaMonthCalendar.jsx'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const currentYearObj = new Date().getFullYear()
const YEARS = Array.from({length: 11}, (_, i) => currentYearObj - 5 + i)

export default function Agenda(){
  const api = useAppState()
  const [mode, setMode] = useState('list') // 'list' | 'form'
  const [viewTab, setViewTab] = useState('dia') // 'dia' | 'semana' | 'mes'
  const [serviceValue, setServiceValue] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10))
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const role = api.state.userRole
  const currentUser = api.state.currentUser
  const employees = api.state.employees || []
  // Find logged in employee if role is funcionario
  const myEmployee = employees.find(e => e.userId === currentUser?.id || e.email === currentUser?.email)
  const [filterEmployee, setFilterEmployee] = useState(role === 'funcionario' && myEmployee ? myEmployee.id : '')
  const services = api.getServices ? api.getServices() : []
  let allAppointments = api.state.appointments || []
  // View Filtering
  const currentDateObj = new Date(selectedDate + 'T12:00:00')
  const startOfWeek = new Date(currentDateObj)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  const currentMonth = selectedDate.slice(0,7)
  const filteredAppointments = allAppointments.filter(a => {
    // 1. Role / Professional Filter
    if (role === 'funcionario') {
      if (myEmployee && a.employeeId !== myEmployee.id) return false
    } else {
      if (filterEmployee && a.employeeId !== filterEmployee) return false
    }
    // 2. Date Filter
    if (viewTab === 'dia') {
      return a.date === selectedDate
    } else if (viewTab === 'semana') {
      const dDate = new Date(a.date + 'T12:00:00')
      return dDate >= startOfWeek && dDate <= endOfWeek
    } else if (viewTab === 'mes') {
      return a.date && a.date.startsWith(currentMonth)
    }
    return true
  }).sort((a,b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.time.localeCompare(b.time)
  })

  function handlePrevMonth() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setMonth(d.getMonth() - 1)
    setSelectedDate(d.toISOString().slice(0, 10))
  }
  
  function handleNextMonth() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setMonth(d.getMonth() + 1)
    setSelectedDate(d.toISOString().slice(0, 10))
  }
  
  function handleMonthSelect(e) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setMonth(parseInt(e.target.value))
    setSelectedDate(d.toISOString().slice(0, 10))
  }
  
  function handleYearSelect(e) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setFullYear(parseInt(e.target.value))
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  function openForm(){ setMode('form'); setServiceValue('') }
  function closeForm(){ setMode('list'); setServiceValue('') }
  function onServiceChange(e){
    const svcName = e.target.value
    const svc = services.find(s => s.name === svcName)
    if (svc) setServiceValue(svc.price ? svc.price.toString() : '0')
  }
  function handleCancelConfirm(e){
    e.preventDefault()
    if(!cancelReason.trim()) return alert("Insira o motivo!")
    api.updateAppointment(cancelModal.id, { 
      status: 'cancelled', 
      cancelReason: cancelReason 
    })
    setCancelModal(null)
    setCancelReason('')
  }
  function handleStatusChange(appt, newStatus){
    if (newStatus === 'cancelled') {
       setCancelModal(appt)
       setCancelReason('')
    } else {
       api.updateAppointment(appt.id, { status: newStatus })
    }
  }
  function onSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    // Assign professional based on role
    let empId = fd.get('employeeId')
    if (role === 'funcionario' && myEmployee) {
      empId = myEmployee.id
    }
    if (!fd.get('patientId')) return alert('Selecione um paciente')
    const data = {
      id: `a_${Date.now()}`,
      patientId: fd.get('patientId'),
      employeeId: empId || null,
      date: fd.get('date'),
      time: fd.get('time'),
      service: fd.get('service'),
      value: Number(fd.get('value')) || 0,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    api.addAppointment(data)
    closeForm()
  }
  if (mode === 'form'){
    return (
      <div className="animate-in">
        <h2 className="page-title">Novo Agendamento</h2>
        <div className="card">
          <form onSubmit={onSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Paciente</label>
                <select name="patientId" required>
                  <option value="">Selecione um paciente...</option>
                  {(api.state.patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName || 'Sem nome'} - {p.cpf}</option>)}
                </select>
              </div>
              {role !== 'funcionario' && (
                <div className="form-group">
                  <label>Profissional</label>
                  <select name="employeeId">
                    <option value="">Selecione o profissional (Opcional)</option>
                    {employees.filter(e => e.role !== 'recepcao' && e.role !== 'gestor').map(e => (
                      <option key={e.id} value={e.id}>Dr(a). {e.name} - {e.role}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Data</label>
                <input name="date" type="date" defaultValue={selectedDate} required />
              </div>
              <div className="form-group">
                <label>Horário</label>
                <input name="time" type="time" required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Serviço</label>
                <select name="service" onChange={onServiceChange}>
                  <option value="">Selecione um serviço (Opcional)...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} — R$ {(s.price || 0).toFixed(2)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Valor (R$)</label>
                <input name="value" type="number" step="0.01" value={serviceValue} onChange={e => setServiceValue(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Salvar Agendamento</button>
              <button type="button" onClick={closeForm} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  // Modais
  if (cancelModal) {
    const p = (api.state.patients || []).find(x => x.id === cancelModal.patientId) || {}
    return (
      <div className="animate-in">
         <div className="card">
            <h3 style={{color:'#b91c1c', marginBottom:'1rem'}}>Cancelar Agendamento</h3>
            <div style={{marginBottom:'1rem', fontSize:'0.875rem', color:'#374151'}}>
               Paciente: <strong>{p.fullName || 'Removido'}</strong><br/>
               Data e Hora: {cancelModal.date} às {cancelModal.time}
            </div>
            <form onSubmit={handleCancelConfirm}>
               <div className="form-group">
                 <label>Motivo do Desmarque / Cancelamento *</label>
                 <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} required rows="3" placeholder="Ex: Paciente informou que não se sente bem..."></textarea>
                 <p style={{fontSize:'0.75rem', color:'#64748b', marginTop:'0.25rem'}}>Atenção: Ao confirmar, este horário será marcado como "vago" na agenda.</p>
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="submit" className="btn-danger">Confirmar Desmarque</button>
                 <button type="button" onClick={() => setCancelModal(null)} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Voltar</button>
               </div>
            </form>
         </div>
      </div>
    )
  }
  const isGlobal = role === 'gestor' || role === 'recepcao'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          {isGlobal ? 'Agenda Global' : 'Minha Agenda'}
        </h2>
        <button onClick={openForm} className="bg-medical-green">+ Novo Agendamento</button>
      </div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => setViewTab('dia')} style={{ borderRadius: 0, border: 'none', background: viewTab === 'dia' ? '#e2e8f0' : 'transparent', color: viewTab === 'dia' ? '#0f172a' : '#64748b', padding: '0.5rem 1rem' }}>Dia</button>
            <button onClick={() => setViewTab('semana')} style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', background: viewTab === 'semana' ? '#e2e8f0' : 'transparent', color: viewTab === 'semana' ? '#0f172a' : '#64748b', padding: '0.5rem 1rem' }}>Semana (Grid)</button>
            <button onClick={() => setViewTab('mes')} style={{ borderRadius: 0, border: 'none', background: viewTab === 'mes' ? '#e2e8f0' : 'transparent', color: viewTab === 'mes' ? '#0f172a' : '#64748b', padding: '0.5rem 1rem' }}>Mês (Calendário)</button>
          </div>
          
          {viewTab === 'mes' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button title="Mês Anterior" onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontWeight: 'bold', color: '#64748b', borderRadius: '4px' }}>&lt;</button>
              <select value={parseInt(selectedDate.slice(5,7)) - 1} onChange={handleMonthSelect} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', color: '#0f172a', padding: '0.25rem', cursor: 'pointer', outline: 'none', fontSize: '1rem' }}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedDate.slice(0,4)} onChange={handleYearSelect} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', color: '#0f172a', padding: '0.25rem', cursor: 'pointer', outline: 'none', fontSize: '1rem' }}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button title="Próximo Mês" onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontWeight: 'bold', color: '#64748b', borderRadius: '4px' }}>&gt;</button>
            </div>
          ) : (
            <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
              <input type="date" value={selectedDate} onChange={e => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedDate(new Date().toISOString().slice(0, 10));
                    return;
                  }
                  setSelectedDate(val)
              }} style={{ padding: '0.5rem' }} />
            </div>
          )}

          {isGlobal && (
             <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} style={{ padding: '0.5rem' }}>
                   <option value="">Todos Profissionais</option>
                   {employees.filter(e => e.role !== 'recepcao' && e.role !== 'gestor').map(e => (
                     <option key={e.id} value={e.id}>Dr(a). {e.name}</option>
                   ))}
                </select>
             </div>
          )}
        </div>
      </div>

      {viewTab === 'semana' ? (
        <AgendaCalendar 
          appointments={filteredAppointments} 
          startOfWeek={startOfWeek} 
          api={api} 
          employees={employees} 
          handleStatusChange={handleStatusChange} 
          isGlobal={isGlobal} 
        />
      ) : viewTab === 'mes' ? (
        <AgendaMonthCalendar
          appointments={filteredAppointments}
          selectedMonth={currentMonth}
          api={api}
          employees={employees}
          handleStatusChange={handleStatusChange}
          isGlobal={isGlobal}
        />
      ) : (
        <>
          {filteredAppointments.length ? filteredAppointments.map(a => {
            const p = (api.state.patients || []).find(x => x.id === a.patientId) || { fullName: 'Paciente removido', healthPlan: '' }
            const emp = employees.find(x => x.id === a.employeeId)
            const isCancelled = a.status === 'cancelled'
            return (
              <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: isCancelled ? '4px solid #ef4444' : '4px solid #10b981', opacity: isCancelled ? 0.75 : 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: isCancelled ? '#ef4444' : '#0d5c4a', fontSize: '1.1rem' }}>{a.date} às {a.time}</span>
                    {isCancelled && <span className="badge badge-cancelled" style={{ fontSize: '0.75rem' }}>Horário Vago / Cancelado</span>}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem', marginTop: '0.25rem', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {p.fullName} {p.healthPlan && <span style={{fontSize:'0.8rem', color:'#0ea5e9'}}>[{p.healthPlan}]</span>}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {a.service || 'Sem serviço'} • R$ {(a.value || 0).toFixed(2)}
                    {isGlobal && emp && <span style={{marginLeft:'0.5rem'}}>• 👨‍⚕️ Dr(a). {emp.name}</span>}
                  </div>
                  {isCancelled && a.cancelReason && (
                    <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '0.5rem', background: '#fef2f2', padding: '0.4rem', borderRadius: '4px' }}>
                      <strong>Motivo:</strong> {a.cancelReason}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap:'wrap' }}>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a, e.target.value)}
                    style={{ width: 'auto', minWidth: '150px' }}
                    disabled={isCancelled} // Uma vez cancelado visualmente, mantém vago. Se quiser, pode remarcar clicando em Editar (poderiamos adicionar o btn)
                  >
                    <option value="scheduled">Aguardando</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="in-progress">Em Atendimento</option>
                    <option value="completed">Finalizado</option>
                    {!isCancelled && <option value="cancelled">Faltou / Desmarcar</option>}
                  </select>
                  <button
                    onClick={() => { if(confirm('Remover definitivamente este registro?')) api.removeAppointment(a.id) }}
                    style={{ background: 'transparent', border: '2px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.5rem' }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          }) : (
            <div style={{ color: '#64748b', padding: '1rem 0' }}>Nenhum agendamento encontrado para este período.</div>
          )}
        </>
      )}
    </div>
  )
}
