export default function Sidebar({ currentPage, onNavigate }) {
  const navItems = [
    { section: 'General' },
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'nueva-venta', label: 'Nueva venta', icon: 'ti-shopping-cart' },
    { id: 'historial', label: 'Historial', icon: 'ti-receipt' },
    { id: 'productos', label: 'Productos', icon: 'ti-pill' },
    { id: 'clientes', label: 'Clientes', icon: 'ti-users' },
    { id: 'empleados', label: 'Empleados', icon: 'ti-id-badge' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">
          <i className="ti ti-heart-plus" />
          <span>Nova Salud</span>
        </div>
        <div className="sub">Sistema de ventas</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, idx) =>
          item.section ? (
            <div key={idx} className="nav-section">{item.section}</div>
          ) : (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <i className={`ti ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">JR</div>
          <div className="user-info">
            <div className="name">Juan Ríos</div>
            <div className="role">Vendedor</div>
          </div>
        </div>
      </div>
    </aside>
  )
}