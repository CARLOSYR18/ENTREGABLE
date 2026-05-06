import { empleados } from '../data/mockData'

export default function Empleados() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="Buscar empleado..." />
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary">
          <i className="ti ti-plus" />
          Nuevo empleado
        </button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre completo</th>
              <th>Cargo</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(e => (
              <tr key={e.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{e.dni}</td>
                <td style={{ fontWeight: 500 }}>{e.nombre}</td>
                <td><span className="badge badge-info">{e.cargo}</span></td>
                <td style={{ color: 'var(--gray-500)' }}>@{e.usuario}</td>
                <td><span className="badge badge-success">{e.estado}</span></td>
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
