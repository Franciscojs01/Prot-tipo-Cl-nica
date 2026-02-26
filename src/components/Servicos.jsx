import React, { useState } from 'react'
import { useAppState } from '../state.jsx'

export default function Servicos(){
  const api = useAppState()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [editing, setEditing] = useState(null)

  const services = api.state.services || []

  function handleSubmit(e){
    e.preventDefault()
    if (!name.trim() || !price) return

    if (editing) {
      // Update existing service
      const updatedServices = services.map(s =>
        s.id === editing.id ? { ...s, name: name.trim(), price: Number(price) } : s
      )
      api.setServices(updatedServices)
    } else {
      // Add new service
      const newService = {
        id: `s_${Date.now()}`,
        name: name.trim(),
        price: Number(price)
      }
      api.addService(newService)
    }

    setName('')
    setPrice('')
    setEditing(null)
  }

  function startEdit(service){
    setEditing(service)
    setName(service.name)
    setPrice(service.price.toString())
  }

  function cancelEdit(){
    setEditing(null)
    setName('')
    setPrice('')
  }

  function removeService(id){
    if (confirm('Remover este serviço?')) {
      const updatedServices = services.filter(s => s.id !== id)
      api.setServices(updatedServices)
    }
  }

  return (
    <div>
      <h2 className="page-title">Tabela de Serviços</h2>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>Serviços Cadastrados</h3>
        {services.length ? (
          <div>
            {services.map(s => (
              <div key={s.id} className="list-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{s.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#0d5c4a', fontSize: '1.1rem' }}>
                    R$ {s.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => startEdit(s)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removeService(s.id)}
                    className="btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#64748b', padding: '1rem 0' }}>Nenhum serviço cadastrado</div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#0d3d32' }}>
          {editing ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Nome do Serviço</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Consulta, Fisioterapia..."
                required
              />
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="bg-medical-green">
              {editing ? 'Salvar Alterações' : 'Adicionar Serviço'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{ background: 'transparent', border: '2px solid #64748b', color: '#64748b' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
