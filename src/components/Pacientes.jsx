import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Pacientes(){
  const api = useAppState()
  const [mode, setMode] = useState('list') // 'list' | 'form' | 'addService'
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [serviceValue, setServiceValue] = useState('')

  const services = api.getServices ? api.getServices() : []

  function openForm(patient){ setEditing(patient || null); setMode('form') }
  function closeForm(){ setMode('list'); setEditing(null) }

  function openAddService(patient){
    setSelectedPatient(patient)
    setServiceValue('')
    setMode('addService')
  }
  function closeAddService(){ setMode('list'); setSelectedPatient(null); setServiceValue('') }

  function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      fullName: fd.get('fullName')?.trim(),
      phone: fd.get('phone')?.trim(),
      email: fd.get('email')?.trim(),
      notes: fd.get('notes')?.trim()
    }
    if (editing) {
      api.updatePatient(editing.id, data)
    } else {
      const id = `p_${Date.now()}`
      const now = new Date().toISOString()
      api.addPatient({ id, createdAt: now, updatedAt: now, ...data })
    }
    closeForm()
  }

  function onServiceChange(e){
    const svcName = e.target.value
    const svc = services.find(s => s.name === svcName)
    if (svc) setServiceValue(svc.price.toString())
  }

  function handleAddService(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      id: `a_${Date.now()}`,
      patientId: selectedPatient.id,
      date: fd.get('date'),
      time: fd.get('time'),
      service: fd.get('service'),
      value: Number(fd.get('value')) || 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    api.addAppointment(data)
    closeAddService()
  }

  // Tela de adicionar serviço ao paciente
  if (mode === 'addService' && selectedPatient){
    const today = new Date().toISOString().slice(0,10)
    const now = new Date().toTimeString().slice(0,5)
    return (
      <div>
        <h2 className="page-title">Adicionar Serviço</h2>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
              {selectedPatient.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{selectedPatient.fullName}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedPatient.phone} • {selectedPatient.email}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Novo Serviço Realizado</h3>
          <form onSubmit={handleAddService}>
            <div className="grid-2">
              <div className="form-group">
                <label>Data</label>
                <input name="date" type="date" defaultValue={today} required />
              </div>
              <div className="form-group">
                <label>Horário</label>
                <input name="time" type="time" defaultValue={now} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Serviço</label>
                <select name="service" onChange={onServiceChange} required>
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} — R$ {s.price.toFixed(2)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Valor (R$)</label>
                <input name="value" type="number" step="0.01" value={serviceValue} onChange={e => setServiceValue(e.target.value)} placeholder="0.00" required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Registrar Serviço</button>
              <button type="button" onClick={closeAddService} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Tela de cadastro/edição de paciente
  if (mode === 'form'){
    const p = editing || {}
    return (
      <div>
        <h2 className="page-title">{editing ? 'Editar Paciente' : 'Novo Paciente'}</h2>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo</label>
              <input name="fullName" required defaultValue={p.fullName||''} placeholder="Nome do paciente" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Telefone</label>
                <input name="phone" required defaultValue={p.phone||''} placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" defaultValue={p.email||''} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Observações</label>
              <textarea name="notes" defaultValue={p.notes||''} rows="3" placeholder="Anotações sobre o paciente..."></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Salvar Paciente</button>
              <button type="button" onClick={closeForm} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Lista de pacientes
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Pacientes</h2>
        <button onClick={() => openForm(null)} className="bg-medical-green">+ Novo Paciente</button>
      </div>

      {api.state.patients.length ? api.state.patients.map(p => {
        const patientAppts = api.state.appointments.filter(a => a.patientId === p.id)
        const total = patientAppts.reduce((s,a) => s + (a.value||0), 0)
        return (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {p.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{p.fullName}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{p.phone} • {p.email}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#0d5c4a', fontSize: '1.1rem' }}>R$ {total.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>total gasto</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openAddService(p)}
                className="bg-medical-green"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                + Adicionar Serviço
              </button>
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {expanded === p.id ? 'Ocultar histórico' : 'Ver histórico'} ({patientAppts.length})
              </button>
              <button onClick={() => openForm(p)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Editar</button>
              <button
                onClick={() => { if(confirm('Confirma excluir este paciente?')) api.removePatient(p.id) }}
                className="btn-danger"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Excluir
              </button>
            </div>

            {expanded === p.id && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Histórico de Serviços</div>
                {patientAppts.length ? (
                  <div>
                    {patientAppts.map(a => (
                      <div key={a.id} className="list-item" style={{ padding: '0.75rem 0' }}>
                        <div>
                          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{a.date} às {a.time}</span>
                          <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>— {a.service}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: '#0d5c4a' }}>R$ {(a.value||0).toFixed(2)}</span>
                          <button
                            onClick={() => { if(confirm('Remover este serviço?')) api.removeAppointment(a.id) }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', border: 'none' }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', padding: '0.5rem 0' }}>Nenhum serviço registrado para este paciente</div>
                )}
              </div>
            )}
          </div>
        )
      }) : (
        <div className="card" style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum paciente cadastrado</div>
          <div style={{ fontSize: '0.875rem' }}>Clique em "Novo Paciente" para começar</div>
        </div>
      )}
    </div>
  )
}
