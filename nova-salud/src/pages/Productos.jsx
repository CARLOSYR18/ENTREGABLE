import { useState } from 'react'
import { productos } from '../data/mockData'

function stockBadge(stock) {
  if (stock <= 5) return <span className="badge badge-danger">{stock} u.</span>
  if (stock <= 20) return <span className="badge badge-warning">{stock} u.</span>
  return <span className="badge badge-success">{stock} u.</span>
}

export default function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')

  const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))]

  const filtrados = productos.filter(p => {
    const matchBusq = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.laboratorio.toLowerCase().includes(busqueda.toLowerCase())
    const matchCat = categoria === 'Todas' || p.categoria === categoria
    return matchBusq && matchCat
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Buscar medicamento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          className="form-control"
          style={{ maxWidth: 180 }}
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary">
          <i className="ti ti-plus" />
          Nuevo producto
        </button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre comercial</th>
              <th>Laboratorio</th>
              <th>Categoría</th>
              <th>Presentación</th>
              <th>Precio unit.</th>
              <th>Stock</th>
              <th>Vence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                <td>{p.laboratorio}</td>
                <td><span className="badge badge-info">{p.categoria}</span></td>
                <td>{p.presentacion}</td>
                <td>S/ {p.precio.toFixed(2)}</td>
                <td>{stockBadge(p.stock)}</td>
                <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{p.vence}</td>
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
