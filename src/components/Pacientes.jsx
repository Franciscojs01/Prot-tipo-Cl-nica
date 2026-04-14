import React, { useState, useEffect } from 'react'
import { useAppState } from '../state.jsx'

export default function Pacientes() {
  const api = useAppState()

  // --- 1. HOOKS (Sempre no topo, fora de qualquer IF) ---
  const [mode, setMode] = useState('list')
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [serviceValue, setServiceValue] = useState('')

  // Estados do formulário movidos para o topo para evitar o erro de Render
  const [localBirth, setLocalBirth] = useState('')
  const [localMethod, setLocalMethod] = useState('Particular')

  const services = api.getServices ? api.getServices() : []
  const patients = api.state.patients ?? []
  const employees = api.state.employees ?? []

  // --- 2. FUNÇÕES DE NAVEGAÇÃO ---
  function openForm(patient) {
    setEditing(patient ?? null)
    setLocalBirth(patient?.birthDate ?? '')
    setLocalMethod(patient?.paymentMethod ?? 'Particular')
    setMode('form')
  }

  function closeForm() {
    setMode('list')
    setEditing(null)
    setLocalBirth('')
    setLocalMethod('Particular')
  }

  // --- 3. LÓGICA DE CÁLCULO DE IDADE ---
  const getAge = (dateString) => {
    if (!dateString) return null
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const currentAge = getAge(localBirth)

  // --- 4. PERSISTÊNCIA DE DADOS ---
  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)

    const data = {
      fullName: fd.get('fullName')?.trim() ?? '',
      cpf: fd.get('cpf')?.trim() ?? '',
      birthDate: localBirth,
      paymentMethod: localMethod,
      healthPlan: fd.get('healthPlan')?.trim() ?? '',
      healthPlanNumber: fd.get('healthPlanNumber')?.trim() ?? '',
      healthPlanDetails: fd.get('healthPlanDetails')?.trim() ?? '',
      authNumber: fd.get('authNumber')?.trim() ?? '', // Número da guia
      parentName: fd.get('parentName')?.trim() ?? '',
      parentCpf: fd.get('parentCpf')?.trim() ?? '',
      childContact: fd.get('childContact')?.trim() ?? '',
      preferredPayment: fd.get('preferredPayment') ?? '',
      phone: fd.get('phone')?.trim() ?? '',
      email: fd.get('email')?.trim() ?? '',
      notes: fd.get('notes')?.trim() ?? '',
      updatedAt: new Date().toISOString()
    }

    if (editing) {
      api.updatePatient(editing.id, data)
    } else {
      const id = `p_${Date.now()}`
      api.addPatient({
        id,
        createdAt: new Date().toISOString(),
        ...data
      })
    }
    closeForm()
  }

  function handleAddService(e) {
    e.preventDefault()
    if (!selectedPatient) return
    const fd = new FormData(e.target)
    api.addAppointment({
      id: `a_${Date.now()}`,
      patientId: selectedPatient.id,
      date: fd.get('date'),
      time: fd.get('time'),
      service: fd.get('service'),
      value: Number(fd.get('value')) ?? 0,
      status: 'completed',
      createdAt: new Date().toISOString()
    })
    setMode('list')
    setSelectedPatient(null)
  }

  // --- 5. RENDERIZAÇÃO CONDICIONAL (TELAS) ---

  if (mode === 'addService' && selectedPatient) {
    return (
        <div className="animate-in">
          <h2 className="page-title">Registrar Atendimento</h2>
          <div className="card">
            <form onSubmit={handleAddService}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Serviço</label>
                  <select name="service" required onChange={(e) => {
                    const s = services.find(sv => sv.name === e.target.value)
                    if (s) setServiceValue(s.price.toString())
                  }}>
                    <option value="">Selecione...</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input name="value" type="number" step="0.01" value={serviceValue} onChange={e => setServiceValue(e.target.value)} required />
                </div>
              </div>
              <div className="grid-2">
                <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                <input name="time" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="bg-medical-green">Confirmar</button>
                <button type="button" onClick={() => setMode('list')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
    )
  }

  if (mode === 'form') {
    const p = editing ?? {}
    return (
        <div className="animate-in">
          <h2 className="page-title">{editing ? 'Editar Cadastro' : 'Novo Paciente'}</h2>
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input name="fullName" required defaultValue={p.fullName} />
                </div>
                <div className="form-group">
                  <label>CPF *</label>
                  <input name="cpf" required defaultValue={p.cpf} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Data de Nascimento *</label>
                  <input type="date" required value={localBirth} onChange={e => setLocalBirth(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Plano / Particular *</label>
                  <select value={localMethod} onChange={e => setLocalMethod(e.target.value)}>
                    <option value="Particular">Particular</option>
                    <option value="Convênio">Convênio</option>
                  </select>
                </div>
              </div>

              {/* Campos de Convênio */}
              {localMethod === 'Convênio' && (
                  <div className="grid-2" style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <input name="healthPlan" placeholder="Nome do Plano" defaultValue={p.healthPlan} required />
                    <input name="healthPlanNumber" placeholder="Nº Carteirinha" defaultValue={p.healthPlanNumber} required />
                    <input name="authNumber" placeholder="Nº Guia/Autorização" defaultValue={p.authNumber} required />
                  </div>
              )}

              {/* Validação de Idade */}
              {currentAge !== null && currentAge < 18 && (
                  <div className="grid-2" style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <input name="parentName" placeholder="Nome do Responsável" defaultValue={p.parentName} required />
                    <input name="parentCpf" placeholder="CPF do Responsável" defaultValue={p.parentCpf} required />
                  </div>
              )}

              {currentAge >= 60 && (
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <input name="childContact" placeholder="Contato do Filho(a) / Emergência" defaultValue={p.childContact} required />
                  </div>
              )}

              {localMethod === 'Particular' && (
                <div className="form-group">
                  <label>Forma de Pagamento Preferencial</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {['PIX', 'Crédito', 'Débito', 'Dinheiro'].map(m => (
                        <label key={m}><input type="radio" name="preferredPayment" value={m} defaultChecked={p.preferredPayment === m} /> {m}</label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid-2" style={{ marginTop: '1rem' }}>
                <input name="phone" placeholder="Telefone" required defaultValue={p.phone} />
                <input name="email" placeholder="Email" defaultValue={p.email} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="bg-medical-green">Salvar Cadastro</button>
                <button type="button" onClick={closeForm}>Voltar</button>
              </div>
            </form>
          </div>
        </div>
    )
  }

  // --- 6. TELA DE LISTAGEM ---
  return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 className="page-title">Pacientes</h2>
          <button onClick={() => openForm(null)} className="bg-medical-green">+ Novo Paciente</button>
        </div>

        {patients.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#64748b' }}>Nenhum paciente cadastrado.</div>
        ) : (
            patients.map(p => (
                <div key={p.id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.cpf} | {p.paymentMethod}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setSelectedPatient(p); setMode('addService') }} className="btn-small bg-medical-green">Atender</button>
                      <button onClick={() => openForm(p)} className="btn-small">Editar</button>
                      <button onClick={() => api.removePatient(p.id)} className="btn-small btn-danger">Excluir</button>
                    </div>
                  </div>
                </div>
            ))
        )}
      </div>
  )
}