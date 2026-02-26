import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function FolhaPagamento(){
  const api = useAppState()
  const [mode, setMode] = useState('list')
  const [editing, setEditing] = useState(null)
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0,7))

  const employees = api.state.employees || []
  const payroll = api.state.payroll || []

  function openForm(entry = null){ setEditing(entry); setMode('form') }
  function closeForm(){ setMode('list'); setEditing(null) }

  function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = {
      employeeId: fd.get('employeeId'),
      month: fd.get('month'),
      baseSalary: Number(fd.get('baseSalary')) || 0,
      bonus: Number(fd.get('bonus')) || 0,
      deductions: Number(fd.get('deductions')) || 0,
      netSalary: (Number(fd.get('baseSalary')) || 0) + (Number(fd.get('bonus')) || 0) - (Number(fd.get('deductions')) || 0),
      status: fd.get('status'),
      paymentDate: fd.get('paymentDate'),
      notes: fd.get('notes')?.trim()
    }
    if (editing) {
      api.updatePayroll(editing.id, { ...data, updatedAt: new Date().toISOString() })
    } else {
      const id = `pay_${Date.now()}`
      const now = new Date().toISOString()
      api.addPayroll({ id, createdAt: now, updatedAt: now, ...data })
    }
    closeForm()
  }

  function getEmployeeById(id){
    return employees.find(e => e.id === id)
  }

  // Tela de cadastro/edição de pagamento
  if (mode === 'form'){
    const pay = editing || {}
    const currentMonth = new Date().toISOString().slice(0,7)
    const selectedEmp = pay.employeeId ? getEmployeeById(pay.employeeId) : null

    return (
      <div>
        <h2 className="page-title">{editing ? 'Editar Pagamento' : 'Registrar Pagamento'}</h2>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Funcionário</label>
                <select
                  name="employeeId"
                  defaultValue={pay.employeeId || ''}
                  required
                  onChange={(e) => {
                    const emp = getEmployeeById(e.target.value)
                    if (emp) {
                      document.querySelector('input[name="baseSalary"]').value = emp.salary || 0
                    }
                  }}
                >
                  <option value="">Selecione um funcionário...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Mês de Referência</label>
                <input name="month" type="month" defaultValue={pay.month || currentMonth} required />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label>Salário Base (R$)</label>
                <input name="baseSalary" type="number" step="0.01" defaultValue={pay.baseSalary || selectedEmp?.salary || ''} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Bônus/Adicionais (R$)</label>
                <input name="bonus" type="number" step="0.01" defaultValue={pay.bonus || 0} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Descontos (R$)</label>
                <input name="deductions" type="number" step="0.01" defaultValue={pay.deductions || 0} placeholder="0.00" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue={pay.status || 'pendente'}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Data do Pagamento</label>
                <input name="paymentDate" type="date" defaultValue={pay.paymentDate || ''} />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea name="notes" defaultValue={pay.notes||''} rows="2" placeholder="Observações sobre o pagamento..."></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="bg-medical-green">Salvar Pagamento</button>
              <button type="button" onClick={closeForm} style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Filtrar por mês
  const filteredPayroll = payroll.filter(p => p.month === monthFilter).sort((a,b) => {
    const empA = getEmployeeById(a.employeeId)?.name || ''
    const empB = getEmployeeById(b.employeeId)?.name || ''
    return empA.localeCompare(empB)
  })

  const totalPaid = filteredPayroll.filter(p => p.status === 'pago').reduce((s,p) => s + (p.netSalary||0), 0)
  const totalPending = filteredPayroll.filter(p => p.status !== 'pago').reduce((s,p) => s + (p.netSalary||0), 0)

  const statusLabels = {
    pendente: 'Pendente',
    pago: 'Pago',
    atrasado: 'Atrasado'
  }
  const statusBadges = {
    pendente: 'badge-scheduled',
    pago: 'badge-completed',
    atrasado: 'badge-cancelled'
  }

  // Lista de folha de pagamento
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Folha de Pagamento</h2>
        <button onClick={() => openForm()} className="bg-medical-green">+ Registrar Pagamento</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 600, color: '#374151' }}>Mês:</label>
          <input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card-dark">
          <div className="stats-label">Total Pago</div>
          <div className="stats-value">R$ {totalPaid.toFixed(2)}</div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
          <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>Total Pendente</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#78350f', lineHeight: 1.2 }}>R$ {totalPending.toFixed(2)}</div>
        </div>
      </div>

      {filteredPayroll.length ? filteredPayroll.map(pay => {
        const emp = getEmployeeById(pay.employeeId)

        return (
          <div key={pay.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {emp ? emp.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{emp ? emp.name : 'Funcionário removido'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {emp?.role && <span>{emp.role}</span>}
                    <span style={{ marginLeft: '0.5rem' }}>• Ref: {pay.month}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.25rem' }}>R$ {(pay.netSalary||0).toFixed(2)}</div>
                <span className={`badge ${statusBadges[pay.status] || 'badge-scheduled'}`}>
                  {statusLabels[pay.status] || pay.status}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
              <div><strong>Base:</strong> R$ {(pay.baseSalary||0).toFixed(2)}</div>
              <div><strong>Bônus:</strong> R$ {(pay.bonus||0).toFixed(2)}</div>
              <div><strong>Descontos:</strong> R$ {(pay.deductions||0).toFixed(2)}</div>
              {pay.paymentDate && <div><strong>Pago em:</strong> {pay.paymentDate}</div>}
            </div>

            {pay.notes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                {pay.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {pay.status !== 'pago' && (
                <button
                  onClick={() => api.updatePayroll(pay.id, { status: 'pago', paymentDate: new Date().toISOString().slice(0,10) })}
                  className="bg-medical-green"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Marcar como Pago
                </button>
              )}
              <button onClick={() => openForm(pay)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Editar</button>
              <button
                onClick={() => { if(confirm('Confirma excluir este registro de pagamento?')) api.removePayroll(pay.id) }}
                className="btn-danger"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Excluir
              </button>
            </div>
          </div>
        )
      }) : (
        <div className="card" style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum pagamento registrado para este mês</div>
          <div style={{ fontSize: '0.875rem' }}>Clique em "Registrar Pagamento" para começar</div>
        </div>
      )}
    </div>
  )
}
