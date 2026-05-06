import { useState } from 'react'
import { clientes } from '../data/mockData'

export default function Clientes() {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = clientes.filter(c =>
    !busqueda ||
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.doc.includes(busqueda)
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <input
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary">
          <i className="ti ti-plus" />
          Nuevo cliente
        </button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo doc.</th>
              <th>N° documento</th>
              <th>Nombre / Razón social</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td><span className="badge badge-info">{c.tipo}</span></td>
                <td style={{ fontWeight: 600 }}>{c.doc}</td>
                <td>{c.nombre}</td>
                <td style={{ color: 'var(--gray-500)' }}>{c.direccion}</td>
                <td>{c.telefono}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" title="Editar"><i className="ti ti-edit" /></button>
                    <button className="icon-btn danger" title="Eliminar"><i className="ti ti-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
