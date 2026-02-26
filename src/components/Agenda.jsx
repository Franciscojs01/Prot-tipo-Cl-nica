import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Agenda(){
  const api = useAppState()
  const [mode, setMode] = useState('list')
  const [serviceValue, setServiceValue] = useState('')

  const today = new Date().toISOString().slice(0,10)
  const list = api.state.appointments.filter(a => a.date === today)
  const services = api.getServices ? api.getServices() : []

  function openForm(){ setMode('form'); setServiceValue('') }
  function closeForm(){ setMode('list'); setServiceValue('') }

  function onServiceChange(e){
    const svcName = e.target.value
    const svc = services.find(s => s.name === svcName)
    if (svc) setServiceValue(svc.price.toString())
  }

  function onSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      id: `a_${Date.now()}`,
      patientId: fd.get('patientId'),
      date: fd.get('date'),
      time: fd.get('time'),
      service: fd.get('service'),
      value: Number(fd.get('value')) || 0,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (!data.patientId) return alert('Selecione um paciente')
    api.addAppointment(data)
    closeForm()
  }

  if (mode === 'form'){
    return (
      <div>
        <h2 className="page-title">Novo Agendamento</h2>
        <div className="card">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Paciente</label>
              <select name="patientId" required>
                <option value="">Selecione um paciente...</option>
                {api.state.patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Data</label>
                <input name="date" type="date" defaultValue={today} required />
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
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} — R$ {s.price.toFixed(2)}</option>)}
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Agenda de Hoje</h2>
        <button onClick={openForm} className="bg-medical-green">+ Novo Agendamento</button>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{today}</p>

      {list.length ? list.map(a => {
        const p = api.state.patients.find(x => x.id === a.patientId) || { fullName: 'Paciente removido' }
        return (
          <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem' }}>{a.time} — {p.fullName}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{a.service} • R$ {(a.value||0).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={a.status}
                onChange={(e) => api.updateAppointment(a.id, { status: e.target.value })}
                style={{ width: 'auto', minWidth: '150px' }}
              >
                <option value="scheduled">Aguardando</option>
                <option value="confirmed">Confirmado</option>
                <option value="in-progress">Em Atendimento</option>
                <option value="completed">Finalizado</option>
                <option value="cancelled">Faltou/Cancelado</option>
              </select>
              <button
                onClick={() => { if(confirm('Remover agendamento?')) api.removeAppointment(a.id) }}
                className="btn-danger"
                style={{ padding: '0.5rem 1rem' }}
              >
                Remover
              </button>
            </div>
          </div>
        )
      }) : (
        <div className="card" style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum agendamento para hoje</div>
          <div style={{ fontSize: '0.875rem' }}>Clique em "Novo Agendamento" para começar</div>
        </div>
      )}
    </div>
  )
}
