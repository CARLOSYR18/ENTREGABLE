export default function Sidebar({ currentPage, onNavigate, user, profile, onLogout }) {
  const navItems = [
    { section: 'General' },
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'nueva-venta', label: 'Nueva venta', icon: 'ti-shopping-cart' },
    { id: 'historial', label: 'Historial', icon: 'ti-receipt' },
    { id: 'productos', label: 'Productos', icon: 'ti-pill' },
    { id: 'clientes', label: 'Clientes', icon: 'ti-users' },
    { id: 'empleados', label: 'Empleados', icon: 'ti-id-badge' },
  ]

  const name = profile?.full_name || user?.email || 'Usuario'
  const role = profile?.role || 'usuario'

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="flex min-h-screen flex-col border-r border-emerald-900/10 bg-white px-5 py-7 text-slate-900 shadow-[10px_0_34px_rgba(15,23,42,0.06)] max-[1100px]:px-3">
      <div className="mb-9">
        <div className="flex items-center gap-3 text-[22px] font-black text-[#176b58] max-[1100px]:justify-center">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <i className="ti ti-heart-plus text-[25px]" />
          </span>
          <span className="max-[1100px]:hidden">Nova Salud</span>
        </div>
        <div className="mt-2 text-[13px] font-medium text-slate-500 max-[1100px]:hidden">
          Sistema de ventas
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item, idx) =>
          item.section ? (
            <div
              key={idx}
              className="mb-2 mt-1 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 max-[1100px]:hidden"
            >
              {item.section}
            </div>
          ) : (
            <button
              key={item.id}
              className={`group relative flex w-full animate-sidebar-item-in items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left text-[15px] font-semibold outline-none transition-[background,box-shadow,color,transform] duration-500 ease-out max-[1100px]:justify-center max-[1100px]:px-0 ${
                currentPage === item.id
                  ? 'animate-sidebar-active bg-gradient-to-r from-emerald-50 to-white text-[#16634f] ring-1 ring-emerald-100'
                  : 'text-slate-500 hover:translate-x-1 hover:bg-slate-50 hover:text-[#176b58] hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]'
              }`}
              style={{ animationDelay: `${idx * 55}ms` }}
              onClick={() => onNavigate(item.id)}
            >
              <span
                className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-all duration-500 ${
                  currentPage === item.id ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-300'
                }`}
              />
              <span
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${
                  currentPage === item.id ? 'opacity-100' : 'group-hover:opacity-100'
                }`}
              >
                <span className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-emerald-100/70 blur-xl" />
              </span>
              <i
                className={`ti ${item.icon} relative z-10 text-[20px] transition-[color,transform] duration-500 ${
                  currentPage === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5'
                }`}
              />
              <span className="relative z-10 max-[1100px]:hidden">{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="mt-6 animate-footer-in border-t border-slate-200 pt-5">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#0d2f26] p-3 ring-1 ring-emerald-900/10 max-[1100px]:justify-center">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-400 text-sm font-black text-[#073024] shadow-[0_0_0_4px_rgba(52,211,153,0.12)]">
            {initials}
          </div>

          <div className="min-w-0 max-[1100px]:hidden">
            <div className="truncate text-sm font-semibold text-white">{name}</div>
            <div className="mt-0.5 text-xs font-medium text-emerald-50/55">
              {role === 'vendedor'
                ? 'Vendedor'
                : role === 'admin'
                ? 'Administrador'
                : 'Usuario'}
            </div>
          </div>
        </div>

        <button
          className="flex w-full items-center justify-start gap-3 rounded-2xl border border-emerald-900/10 bg-[#29483f] px-4 py-3 text-sm font-bold text-emerald-50 transition-[background,box-shadow,color,transform] duration-500 ease-out hover:-translate-y-0.5 hover:bg-[#3c6258] hover:text-white hover:shadow-[0_14px_30px_rgba(13,47,38,0.18)] active:translate-y-0 active:scale-[0.99] max-[1100px]:justify-center max-[1100px]:px-0"
          onClick={onLogout}
        >
          <i className="ti ti-logout text-[20px]" />
          <span className="max-[1100px]:hidden">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
