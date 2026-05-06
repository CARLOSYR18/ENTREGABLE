import { ventas } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Panel general</h1>
          <p>Resumen operativo de Nova Salud</p>
        </div>

        <div className="date-pill">
          <i className="ti ti-calendar" />
          05 Mayo 2026
        </div>
      </div>

      <div className="hero-grid">
        <div className="hero-card main-hero hover-card">
          <div>
            <div className="hero-icon">
              <i className="ti ti-heart-plus" />
            </div>

            <h2>Resumen de ventas</h2>
            <p>Control diario de ventas, comprobantes y productos críticos.</p>
          </div>

          <div className="hero-number">
            <small>Total de ventas hoy</small>
            <strong>S/ 1,842</strong>
            <span>
              <i className="ti ti-trending-up" />
              +12% vs ayer
            </span>
          </div>
        </div>

        <div className="mini-card hover-card">
          <i className="ti ti-receipt" />
          <span>Comprobantes</span>
          <strong>34</strong>
          <small>24 boletas · 10 facturas</small>
        </div>

        <div className="mini-card warning hover-card">
          <i className="ti ti-alert-triangle" />
          <span>Stock bajo</span>
          <strong>5</strong>
          <small>Productos críticos</small>
        </div>

        <div className="mini-card orange hover-card">
          <i className="ti ti-calendar-exclamation" />
          <span>Vence pronto</span>
          <strong>8</strong>
          <small>Próximos 30 días</small>
        </div>
      </div>

      <div className="quick-grid">
        <div className="quick-card hover-card">
          <i className="ti ti-capsule" />
          <div>
            <strong>Productos activos</strong>
            <span>248 registrados</span>
          </div>
        </div>

        <div className="quick-card hover-card">
          <i className="ti ti-users" />
          <div>
            <strong>Clientes frecuentes</strong>
            <span>86 clientes</span>
          </div>
        </div>

        <div className="quick-card hover-card">
          <i className="ti ti-trending-up" />
          <div>
            <strong>Crecimiento semanal</strong>
            <span>+18% en ventas</span>
          </div>
        </div>

        <div className="quick-card hover-card">
          <i className="ti ti-shield-check" />
          <div>
            <strong>Ventas seguras</strong>
            <span>100% completadas</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card soft-card hover-card">
          <div className="card-title">
            <div>
              <span>Últimas ventas</span>
              <p>Movimientos recientes del sistema</p>
            </div>
            <i className="ti ti-clock" />
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {ventas.map((v, index) => (
                <tr key={v.id} style={{ animationDelay: `${index * 0.08}s` }}>
                  <td style={{ fontWeight: 700 }}>{v.comprobante}</td>
                  <td>
                    <span className={v.tipo === 'Boleta' ? 'tag-boleta' : 'tag-factura'}>
                      {v.tipo}
                    </span>
                  </td>
                  <td>{v.cliente}</td>
                  <td>{v.fecha}</td>
                  <td>{v.vendedor}</td>
                  <td style={{ fontWeight: 800 }}>S/ {v.total.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-success">Completado</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="side-widgets">
          <div className="health-card hover-card">
            <div className="widget-title">
              <h3>Ventas del día</h3>
              <i className="ti ti-chart-line" />
            </div>

            <div className="pulse">S/ 1,842</div>
            <p>+12% vs ayer</p>

            <div className="bar-track">
              <div className="bar-fill"></div>
            </div>
          </div>

          <div className="circle-card hover-card">
            <div className="progress-ring">
              <span>78%</span>
            </div>

            <div>
              <h3>Meta mensual</h3>
              <p>Rendimiento actual</p>
            </div>
          </div>

          <div className="alert-card hover-card">
            <div>
              <h3>Alertas</h3>
              <p>5 productos necesitan reposición.</p>
            </div>
            <i className="ti ti-bell-ringing" />
          </div>
        </div>
      </div>
    </div>
  )
}