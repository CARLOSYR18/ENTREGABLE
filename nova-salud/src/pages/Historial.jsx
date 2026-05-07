import { useState } from 'react'
import { ventas } from '../data/mockData'

export default function Historial() {
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = ventas.filter(v => {
    const matchTipo = filtroTipo === 'Todos' || v.tipo === filtroTipo
    const matchBusq = !busqueda || v.comprobante.toLowerCase().includes(busqueda.toLowerCase()) || v.cliente.toLowerCase().includes(busqueda.toLowerCase())
    return matchTipo && matchBusq
  })

  return (
    <div className="card">
      <div className="card-title" style={{ marginBottom: 16 }}>
        <span>Historial de ventas</span>
        <i className="ti ti-receipt" />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por N° o cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          className="form-control"
          style={{ maxWidth: 150 }}
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option>Todos</option>
          <option>Boleta</option>
          <option>Factura</option>
        </select>
        <input type="date" className="form-control" style={{ maxWidth: 160 }} defaultValue="2026-05-05" />
        <div style={{ flex: 1 }} />
        <button className="btn">
          <i className="ti ti-download" />
          Exportar
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Comprobante</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.length === 0 ? (
            <tr><td colSpan={7} className="empty-state">No se encontraron resultados.</td></tr>
          ) : filtradas.map(v => (
            <tr key={v.id}>
              <td style={{ fontWeight: 600 }}>{v.comprobante}</td>
              <td><span className={v.tipo === 'Boleta' ? 'tag-boleta' : 'tag-factura'}>{v.tipo}</span></td>
              <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{v.fecha}</td>
              <td>{v.cliente}</td>
              <td>{v.vendedor}</td>
              <td style={{ fontWeight: 600 }}>S/ {v.total.toFixed(2)}</td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" title="Ver detalle"><i className="ti ti-eye" /></button>
                  <button className="icon-btn" title="Imprimir"><i className="ti ti-printer" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
