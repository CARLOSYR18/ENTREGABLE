import { useState } from 'react'
import Login from './Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import NuevaVenta from './pages/NuevaVenta'
import Historial from './pages/Historial'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Empleados from './pages/Empleados'

const PAGES = {
  dashboard: Dashboard,
  'nueva-venta': NuevaVenta,
  historial: Historial,
  productos: Productos,
  clientes: Clientes,
  empleados: Empleados,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)

  const PageComponent = PAGES[currentPage] || Dashboard

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="main-area">
        <Topbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onLogout={() => setUser(null)}
        />

        <div className="content-area">
          <PageComponent user={user} />
        </div>
      </div>
    </div>
  )
}