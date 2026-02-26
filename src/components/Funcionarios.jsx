import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Funcionarios(){
  const api = useAppState()
  const [mode, setMode] = useState('list')
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const users = api.state.users || []

  function openForm(emp){ setEditing(emp || null); setMode('form') }
  function closeForm(){ setMode('list'); setEditing(null) }

  function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      name: fd.get('name')?.trim(),
      role: fd.get('role')?.trim(),
      specialty: fd.get('specialty')?.trim(),
      phone: fd.get('phone')?.trim(),
      email: fd.get('email')?.trim(),
      salary: Number(fd.get('salary')) || 0,
      hireDate: fd.get('hireDate'),
      notes: fd.get('notes')?.trim(),
      userId: fd.get('userId') || null
    }
    if (editing) {
      api.updateEmployee(editing.id, { ...data, updatedAt: new Date().toISOString() })
    } else {
      const id = `emp_${Date.now()}`
      const now = new Date().toISOString()
      api.addEmployee({ id, createdAt: now, updatedAt: now, ...data, patients: [] })
    }
    closeForm()
  }

  // Tela de cadastro/edição de funcionário
  if (mode === 'form'){
    const emp = editing || {}
    return (
      <div>
        <h2 className="page-title">{editing ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Nome completo</label>
                <input name="name" required defaultValue={emp.name||''} placeholder="Nome do funcionário" />
              </div>
              <div className="form-group">
                <label>Cargo</label>
                <select name="role" defaultValue={emp.role || 'fisioterapeuta'}>
                  <option value="fisioterapeuta">Fisioterapeuta</option>
                  <option value="medico">Médico</option>
                  <option value="terapeuta">Terapeuta Ocupacional</option>
                  <option value="psicologo">Psicólogo</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="recepcao">Recepção</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Especialidade</label>
                <input name="specialty" defaultValue={emp.specialty||''} placeholder="Ex: Reabilitação neurológica" />
              </div>
              <div className="form-group">
                <label>Data de Contratação</label>
                <input name="hireDate" type="date" defaultValue={emp.hireDate||''} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Telefone</label>
                <input name="phone" defaultValue={emp.phone||''} placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" defaultValue={emp.email||''} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Salário Base (R$)</label>
                <input name="salary" type="number" step="0.01" defaultValue={emp.salary||''} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Vincular a Usuário do Sistema</label>
                <select name="userId" defaultValue={emp.userId || ''}>
                  <option value="">Nenhum (sem acesso ao sistema)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Observações</label>
              <textarea name="notes" defaultValue={emp.notes||''} rows="3" placeholder="Anotações sobre o funcionário..."></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Salvar Funcionário</button>
              <button type="button" onClick={closeForm} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const employees = api.state.employees || []
  const patients = api.state.patients || []

  const roleLabels = {
    fisioterapeuta: 'Fisioterapeuta',
    medico: 'Médico',
    terapeuta: 'Terapeuta Ocupacional',
    psicologo: 'Psicólogo',
    enfermeiro: 'Enfermeiro',
    recepcao: 'Recepção',
    administrativo: 'Administrativo',
    outro: 'Outro'
  }

  function getLinkedUser(emp){
    if (!emp.userId) return null
    return users.find(u => u.id === emp.userId)
  }

  function linkPatient(empId, patientId){
    const emp = employees.find(e => e.id === empId)
    if (!emp) return
    const currentPatients = emp.patients || []
    if (currentPatients.includes(patientId)) return
    api.updateEmployee(empId, { patients: [...currentPatients, patientId] })
  }

  function unlinkPatient(empId, patientId){
    const emp = employees.find(e => e.id === empId)
    if (!emp) return
    const currentPatients = emp.patients || []
    api.updateEmployee(empId, { patients: currentPatients.filter(id => id !== patientId) })
  }

  // Lista de funcionários
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Funcionários</h2>
        <button onClick={() => openForm(null)} className="bg-medical-green">+ Novo Funcionário</button>
      </div>

      {employees.length ? employees.map(emp => {
        const empPatients = (emp.patients || []).map(pid => patients.find(p => p.id === pid)).filter(Boolean)
        const availablePatients = patients.filter(p => !(emp.patients || []).includes(p.id))
        const linkedUser = getLinkedUser(emp)

        return (
          <div key={emp.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <span className="badge badge-confirmed" style={{ marginRight: '0.5rem' }}>{roleLabels[emp.role] || emp.role}</span>
                    {emp.specialty && <span style={{ color: '#64748b' }}>• {emp.specialty}</span>}
                  </div>
                  {linkedUser && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                      ✓ Vinculado ao usuário: {linkedUser.email}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>R$ {(emp.salary||0).toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>salário base</div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
              {emp.phone && <span>{emp.phone}</span>}
              {emp.email && <span> • {emp.email}</span>}
              {emp.hireDate && <span> • Contratado em: {emp.hireDate}</span>}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setExpanded(expanded === emp.id ? null : emp.id)}
                style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {expanded === emp.id ? 'Ocultar pacientes' : 'Ver pacientes'} ({empPatients.length})
              </button>
              <button onClick={() => openForm(emp)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Editar</button>
              <button
                onClick={() => { if(confirm('Confirma excluir este funcionário?')) api.removeEmployee(emp.id) }}
                className="btn-danger"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Excluir
              </button>
            </div>

            {expanded === emp.id && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Pacientes Vinculados</div>

                {/* Select para vincular paciente */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select
                    id={`linkPatient_${emp.id}`}
                    style={{ flex: 1 }}
                    defaultValue=""
                  >
                    <option value="">Selecione um paciente para vincular...</option>
                    {availablePatients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById(`linkPatient_${emp.id}`)
                      if (sel.value) {
                        linkPatient(emp.id, sel.value)
                        sel.value = ''
                      }
                    }}
                    className="bg-medical-green"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Vincular
                  </button>
                </div>

                {empPatients.length ? (
                  <div>
                    {empPatients.map(p => (
                      <div key={p.id} className="list-item" style={{ padding: '0.75rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {p.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{p.fullName}</span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.phone}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => unlinkPatient(emp.id, p.id)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', border: 'none' }}
                        >
                          Desvincular
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', padding: '0.5rem 0' }}>Nenhum paciente vinculado a este funcionário</div>
                )}
              </div>
            )}
          </div>
        )
      }) : (
        <div className="card" style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum funcionário cadastrado</div>
          <div style={{ fontSize: '0.875rem' }}>Clique em "Novo Funcionário" para começar</div>
        </div>
      )}
    </div>
  )
}
