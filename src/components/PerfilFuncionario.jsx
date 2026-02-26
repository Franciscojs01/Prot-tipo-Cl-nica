import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function PerfilFuncionario(){
  const api = useAppState()
  const [activeTab, setActiveTab] = useState('meusPacientes')

  const currentUser = api.state.currentUser
  const employees = api.state.employees || []
  const patients = api.state.patients || []
  const appointments = api.state.appointments || []
  const medicalRecords = api.state.medicalRecords || []
  const payroll = api.state.payroll || []

  // Encontrar o funcionário vinculado ao usuário atual
  // Prioridade: 1) userId vinculado, 2) email igual
  const myEmployee = employees.find(e => e.userId === currentUser?.id) || employees.find(e => e.email === currentUser?.email)

  if (!myEmployee) {
    return (
      <div>
        <h2 className="page-title">Meu Perfil</h2>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <div style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Perfil não vinculado</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Seu usuário ainda não está vinculado a um cadastro de funcionário.<br/>
            Entre em contato com o gestor para realizar a vinculação.
          </div>
        </div>
      </div>
    )
  }

  // Pacientes vinculados ao funcionário
  const myPatients = (myEmployee.patients || [])
    .map(pid => patients.find(p => p.id === pid))
    .filter(Boolean)

  // Agendamentos dos meus pacientes (hoje e futuros)
  const today = new Date().toISOString().slice(0,10)
  const myAppointments = appointments
    .filter(a => myPatients.some(p => p.id === a.patientId))
    .filter(a => a.date >= today)
    .sort((a,b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })

  // Prontuários que eu registrei
  const myRecords = medicalRecords
    .filter(r => r.employeeId === myEmployee.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date))

  // Meus pagamentos
  const myPayroll = payroll
    .filter(p => p.employeeId === myEmployee.id)
    .sort((a,b) => b.month.localeCompare(a.month))

  // Labels de cargo
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

  const statusLabels = {
    scheduled: 'Aguardando',
    confirmed: 'Confirmado',
    'in-progress': 'Em Atendimento',
    completed: 'Finalizado',
    cancelled: 'Cancelado'
  }

  const statusBadges = {
    scheduled: 'badge-scheduled',
    confirmed: 'badge-confirmed',
    'in-progress': 'badge-inprogress',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled'
  }

  const paymentStatusLabels = {
    pendente: 'Pendente',
    pago: 'Pago',
    atrasado: 'Atrasado'
  }

  const paymentStatusBadges = {
    pendente: 'badge-scheduled',
    pago: 'badge-completed',
    atrasado: 'badge-cancelled'
  }

  // Estatísticas
  const totalAtendimentos = myRecords.length
  const atendimentosEsteMes = myRecords.filter(r => r.date?.startsWith(new Date().toISOString().slice(0,7))).length

  return (
    <div>
      {/* Cabeçalho do Perfil */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '2rem',
            boxShadow: '0 4px 12px rgba(6, 95, 70, 0.3)'
          }}>
            {myEmployee.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: '#0d3d32', fontSize: '1.5rem' }}>{myEmployee.name}</h2>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-confirmed" style={{ marginRight: '0.5rem' }}>
                {roleLabels[myEmployee.role] || myEmployee.role}
              </span>
              {myEmployee.specialty && (
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{myEmployee.specialty}</span>
              )}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              {myEmployee.email && <span>{myEmployee.email}</span>}
              {myEmployee.phone && <span> • {myEmployee.phone}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Contratado em</div>
            <div style={{ fontWeight: 600, color: '#374151' }}>{myEmployee.hireDate || 'Não informado'}</div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card-dark">
          <div className="stats-label">Meus Pacientes</div>
          <div className="stats-value">{myPatients.length}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Atendimentos (Total)</div>
          <div className="stats-value">{totalAtendimentos}</div>
        </div>
        <div className="card-dark">
          <div className="stats-label">Atendimentos (Mês)</div>
          <div className="stats-value">{atendimentosEsteMes}</div>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('meusPacientes')}
          className={activeTab === 'meusPacientes' ? 'bg-medical-green' : ''}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          👥 Meus Pacientes
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={activeTab === 'agenda' ? 'bg-medical-green' : ''}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          📅 Próximos Agendamentos
        </button>
        <button
          onClick={() => setActiveTab('prontuarios')}
          className={activeTab === 'prontuarios' ? 'bg-medical-green' : ''}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          📋 Meus Prontuários
        </button>
        <button
          onClick={() => setActiveTab('pagamentos')}
          className={activeTab === 'pagamentos' ? 'bg-medical-green' : ''}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          💰 Meus Pagamentos
        </button>
        <button
          onClick={() => setActiveTab('dados')}
          className={activeTab === 'dados' ? 'bg-medical-green' : ''}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          ⚙️ Meus Dados
        </button>
      </div>

      {/* Conteúdo das Tabs */}

      {/* Tab: Meus Pacientes */}
      {activeTab === 'meusPacientes' && (
        <div>
          <h3 style={{ color: '#0d3d32', marginBottom: '1rem' }}>Meus Pacientes ({myPatients.length})</h3>
          {myPatients.length > 0 ? (
            myPatients.map(patient => {
              const patientAppts = appointments.filter(a => a.patientId === patient.id)
              const patientRecords = medicalRecords.filter(r => r.patientId === patient.id && r.employeeId === myEmployee.id)
              const lastRecord = patientRecords[0]

              return (
                <div key={patient.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.25rem'
                      }}>
                        {patient.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{patient.fullName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {patient.phone} • {patient.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: '#065f46' }}>{patientRecords.length} prontuários</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{patientAppts.length} agendamentos</div>
                    </div>
                  </div>

                  {lastRecord && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Último atendimento: {lastRecord.date}</div>
                      {lastRecord.diagnosis && (
                        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                          <strong>Diagnóstico:</strong> {lastRecord.diagnosis}
                        </div>
                      )}
                      {lastRecord.treatment && (
                        <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                          <strong>Tratamento:</strong> {lastRecord.treatment}
                        </div>
                      )}
                    </div>
                  )}

                  {patient.notes && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                      📝 {patient.notes}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum paciente vinculado</div>
              <div style={{ fontSize: '0.875rem' }}>Seus pacientes aparecerão aqui quando forem vinculados ao seu perfil</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Agenda */}
      {activeTab === 'agenda' && (
        <div>
          <h3 style={{ color: '#0d3d32', marginBottom: '1rem' }}>Próximos Agendamentos ({myAppointments.length})</h3>
          {myAppointments.length > 0 ? (
            myAppointments.map(appt => {
              const patient = patients.find(p => p.id === appt.patientId)
              const isToday = appt.date === today

              return (
                <div key={appt.id} className="card" style={{ borderLeft: isToday ? '4px solid #10b981' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>{appt.time}</span>
                        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{patient?.fullName || 'Paciente removido'}</span>
                        {isToday && <span className="badge badge-completed">Hoje</span>}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                        📅 {appt.date} • {appt.service || 'Sem serviço definido'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${statusBadges[appt.status] || 'badge-scheduled'}`}>
                        {statusLabels[appt.status] || appt.status}
                      </span>
                      {appt.value > 0 && (
                        <div style={{ marginTop: '0.5rem', fontWeight: 600, color: '#065f46' }}>
                          R$ {appt.value.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum agendamento futuro</div>
              <div style={{ fontSize: '0.875rem' }}>Os agendamentos dos seus pacientes aparecerão aqui</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Prontuários */}
      {activeTab === 'prontuarios' && (
        <div>
          <h3 style={{ color: '#0d3d32', marginBottom: '1rem' }}>Meus Prontuários ({myRecords.length})</h3>
          {myRecords.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {myRecords.map(record => {
                const patient = patients.find(p => p.id === record.patientId)

                return (
                  <div key={record.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0d5c4a 0%, #0a4a3c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {patient?.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{patient?.fullName || 'Paciente removido'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{record.date}</div>
                        </div>
                      </div>
                    </div>

                    {record.chiefComplaint && (
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                        <strong>Queixa:</strong> {record.chiefComplaint}
                      </div>
                    )}
                    {record.diagnosis && (
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                        <strong>Diagnóstico:</strong> {record.diagnosis}
                      </div>
                    )}
                    {record.treatment && (
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                        <strong>Tratamento:</strong> {record.treatment}
                      </div>
                    )}
                    {record.evolution && (
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        <strong>Evolução:</strong> {record.evolution}
                      </div>
                    )}

                    {record.vitalSigns && (record.vitalSigns.bloodPressure || record.vitalSigns.heartRate || record.vitalSigns.temperature || record.vitalSigns.weight) && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafb', borderRadius: '8px', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
                        {record.vitalSigns.bloodPressure && <span>🩺 PA: {record.vitalSigns.bloodPressure}</span>}
                        {record.vitalSigns.heartRate && <span>❤️ FC: {record.vitalSigns.heartRate}</span>}
                        {record.vitalSigns.temperature && <span>🌡️ Temp: {record.vitalSigns.temperature}</span>}
                        {record.vitalSigns.weight && <span>⚖️ Peso: {record.vitalSigns.weight}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum prontuário registrado</div>
              <div style={{ fontSize: '0.875rem' }}>Seus prontuários aparecerão aqui quando forem registrados</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Pagamentos */}
      {activeTab === 'pagamentos' && (
        <div>
          <h3 style={{ color: '#0d3d32', marginBottom: '1rem' }}>Meus Pagamentos</h3>

          {/* Resumo de pagamentos */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: 'none' }}>
              <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>Total Recebido</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#047857' }}>
                R$ {myPayroll.filter(p => p.status === 'pago').reduce((s,p) => s + (p.netSalary||0), 0).toFixed(2)}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>Pendente</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b45309' }}>
                R$ {myPayroll.filter(p => p.status !== 'pago').reduce((s,p) => s + (p.netSalary||0), 0).toFixed(2)}
              </div>
            </div>
          </div>

          {myPayroll.length > 0 ? (
            myPayroll.map(pay => (
              <div key={pay.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem' }}>
                      Referência: {pay.month}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Base: R$ {(pay.baseSalary||0).toFixed(2)}
                      {pay.bonus > 0 && ` • Bônus: R$ ${pay.bonus.toFixed(2)}`}
                      {pay.deductions > 0 && ` • Descontos: R$ ${pay.deductions.toFixed(2)}`}
                    </div>
                    {pay.paymentDate && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Pago em: {pay.paymentDate}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.25rem' }}>
                      R$ {(pay.netSalary||0).toFixed(2)}
                    </div>
                    <span className={`badge ${paymentStatusBadges[pay.status] || 'badge-scheduled'}`}>
                      {paymentStatusLabels[pay.status] || pay.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💰</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum pagamento registrado</div>
              <div style={{ fontSize: '0.875rem' }}>Seus pagamentos aparecerão aqui quando forem registrados pelo gestor</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Meus Dados */}
      {activeTab === 'dados' && (
        <div>
          <h3 style={{ color: '#0d3d32', marginBottom: '1rem' }}>Meus Dados</h3>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Nome Completo</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myEmployee.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Cargo</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{roleLabels[myEmployee.role] || myEmployee.role}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Especialidade</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myEmployee.specialty || 'Não informado'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Data de Contratação</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myEmployee.hireDate || 'Não informado'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myEmployee.email || 'Não informado'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Telefone</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myEmployee.phone || 'Não informado'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Salário Base</div>
                <div style={{ fontWeight: 600, color: '#065f46' }}>R$ {(myEmployee.salary||0).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Pacientes Vinculados</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{myPatients.length}</div>
              </div>
            </div>

            {myEmployee.notes && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Observações</div>
                <div style={{ color: '#374151' }}>{myEmployee.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
