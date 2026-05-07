import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      console.log('Error profile:', error.message)
    }

    setProfile(
      data || {
        id: authUser.id,
        email: authUser.email,
        role: 'usuario',
        full_name: authUser.email,
      }
    )
  }

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const authUser = data?.session?.user || null

      setUser(authUser)

      if (authUser) {
        await loadProfile(authUser)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user || null

        setUser(authUser)

        if (authUser) {
          loadProfile(authUser)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCurrentPage('dashboard')
  }

  if (loading) {
    return <div style={{ padding: 30 }}>Cargando...</div>
  }

  if (!user) {
    return <Login />
  }

  const PageComponent = PAGES[currentPage] || Dashboard

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />

      <div className="main-area">
        <Topbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          profile={profile}
          onLogout={handleLogout}
        />

        <div className="content-area">
          <PageComponent user={user} profile={profile} />
        </div>
      </div>
    </div>
  )
}