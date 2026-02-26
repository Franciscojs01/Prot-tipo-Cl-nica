import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Prontuarios(){
  const api = useAppState()
  const [mode, setMode] = useState('list')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [editing, setEditing] = useState(null)
  const [patientFilter, setPatientFilter] = useState('')

  const patients = api.state.patients || []
  const records = api.state.medicalRecords || []
  const employees = api.state.employees || []

  function openForm(patient, record = null){
    setSelectedPatient(patient)
    setEditing(record)
    setMode('form')
  }
  function closeForm(){ setMode('list'); setSelectedPatient(null); setEditing(null) }

  function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      patientId: selectedPatient.id,
      date: fd.get('date'),
      employeeId: fd.get('employeeId') || null,
      chiefComplaint: fd.get('chiefComplaint')?.trim(),
      diagnosis: fd.get('diagnosis')?.trim(),
      treatment: fd.get('treatment')?.trim(),
      evolution: fd.get('evolution')?.trim(),
      observations: fd.get('observations')?.trim(),
      vitalSigns: {
        bloodPressure: fd.get('bloodPressure')?.trim(),
        heartRate: fd.get('heartRate')?.trim(),
        temperature: fd.get('temperature')?.trim(),
        weight: fd.get('weight')?.trim()
      }
    }
    if (editing) {
      api.updateMedicalRecord(editing.id, { ...data, updatedAt: new Date().toISOString() })
    } else {
      const id = `rec_${Date.now()}`
      const now = new Date().toISOString()
      api.addMedicalRecord({ id, createdAt: now, updatedAt: now, ...data })
    }
    closeForm()
  }

  // Tela de cadastro/edição de prontuário
  if (mode === 'form' && selectedPatient){
    const rec = editing || {}
    const today = new Date().toISOString().slice(0,10)

    return (
      <div>
        <h2 className="page-title">{editing ? 'Editar Prontuário' : 'Novo Prontuário'}</h2>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Data do Atendimento</label>
                <input name="date" type="date" defaultValue={rec.date || today} required />
              </div>
              <div className="form-group">
                <label>Profissional Responsável</label>
                <select name="employeeId" defaultValue={rec.employeeId || ''}>
                  <option value="">Selecione um profissional...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.specialty || emp.role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Queixa Principal</label>
              <textarea name="chiefComplaint" defaultValue={rec.chiefComplaint||''} rows="2" placeholder="Descreva a queixa principal do paciente..."></textarea>
            </div>

            <div className="form-group">
              <label>Diagnóstico</label>
              <textarea name="diagnosis" defaultValue={rec.diagnosis||''} rows="2" placeholder="Diagnóstico ou hipótese diagnóstica..."></textarea>
            </div>

            <div className="form-group">
              <label>Tratamento/Conduta</label>
              <textarea name="treatment" defaultValue={rec.treatment||''} rows="2" placeholder="Tratamento prescrito ou conduta adotada..."></textarea>
            </div>

            <div className="form-group">
              <label>Evolução</label>
              <textarea name="evolution" defaultValue={rec.evolution||''} rows="3" placeholder="Evolução do quadro do paciente..."></textarea>
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#0d3d32' }}>Sinais Vitais</h4>
            <div className="grid-2">
              <div className="form-group">
                <label>Pressão Arterial</label>
                <input name="bloodPressure" defaultValue={rec.vitalSigns?.bloodPressure||''} placeholder="Ex: 120/80 mmHg" />
              </div>
              <div className="form-group">
                <label>Frequência Cardíaca</label>
                <input name="heartRate" defaultValue={rec.vitalSigns?.heartRate||''} placeholder="Ex: 72 bpm" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Temperatura</label>
                <input name="temperature" defaultValue={rec.vitalSigns?.temperature||''} placeholder="Ex: 36.5°C" />
              </div>
              <div className="form-group">
                <label>Peso</label>
                <input name="weight" defaultValue={rec.vitalSigns?.weight||''} placeholder="Ex: 70 kg" />
              </div>
            </div>

            <div className="form-group">
              <label>Observações Adicionais</label>
              <textarea name="observations" defaultValue={rec.observations||''} rows="2" placeholder="Outras observações relevantes..."></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Salvar Prontuário</button>
              <button type="button" onClick={closeForm} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Lista de pacientes com prontuários
  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(patientFilter.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Prontuários</h2>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={patientFilter}
          onChange={e => setPatientFilter(e.target.value)}
        />
      </div>

      {filteredPatients.length ? filteredPatients.map(p => {
        const patientRecords = records.filter(r => r.patientId === p.id).sort((a,b) => new Date(b.date) - new Date(a.date))

        return (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {p.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{p.fullName}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{p.phone} • {p.email}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: '#065f46', fontSize: '1rem' }}>{patientRecords.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>registros</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openForm(p)}
                className="bg-medical-green"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                + Novo Prontuário
              </button>
            </div>

            {patientRecords.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Histórico de Prontuários</div>
                {patientRecords.map(rec => {
                  const emp = employees.find(e => e.id === rec.employeeId)
                  return (
                    <div key={rec.id} className="list-item" style={{ padding: '1rem 0', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{rec.date}</span>
                          {emp && <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>— Dr(a). {emp.name}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openForm(p, rec)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => { if(confirm('Remover este prontuário?')) api.removeMedicalRecord(rec.id) }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', border: 'none' }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                      {rec.chiefComplaint && (
                        <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                          <strong>Queixa:</strong> {rec.chiefComplaint}
                        </div>
                      )}
                      {rec.diagnosis && (
                        <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                          <strong>Diagnóstico:</strong> {rec.diagnosis}
                        </div>
                      )}
                      {rec.treatment && (
                        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                          <strong>Tratamento:</strong> {rec.treatment}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      }) : (
        <div className="card" style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum paciente encontrado</div>
          <div style={{ fontSize: '0.875rem' }}>Cadastre pacientes para adicionar prontuários</div>
        </div>
      )}
    </div>
  )
}
