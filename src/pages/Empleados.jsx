import { useEffect, useState } from 'react'
import { createEmployee, deleteEmployee, fetchEmployees } from '../lib/supabaseData'

const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition duration-300 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
const labelClass = 'mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500'

const initialForm = {
  dni: '',
  nombre: '',
  cargo: 'Vendedor',
  usuario: '',
  estado: 'Activo',
}

export default function Empleados() {
  const [items, setItems] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargo, setCargo] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadEmployees = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      setItems(await fetchEmployees())
    } catch (error) {
      setErrorMsg(error.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const cargos = ['Todos', ...new Set(items.map(e => e.cargo))]

  const filtrados = items.filter(e => {
    const term = busqueda.trim().toLowerCase()
    const matchBusq =
      !term ||
      e.nombre.toLowerCase().includes(term) ||
      e.dni.includes(term) ||
      e.usuario.toLowerCase().includes(term)
    const matchCargo = cargo === 'Todos' || e.cargo === cargo
    return matchBusq && matchCargo
  })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.dni.trim() || !form.nombre.trim() || !form.usuario.trim()) return

    try {
      await createEmployee(form)
      setForm(initialForm)
      setModal(false)
      await loadEmployees()
    } catch (error) {
      setErrorMsg(error.message)
    }
  }

  return (
    <div className="space-y-5">
      <section className="animate-dashboard-in rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-2 w-2 animate-subtle-pulse rounded-full bg-emerald-500" />
              Equipo interno
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Empleados</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestiona usuarios, cargos, accesos y estado operativo del personal.
            </p>
          </div>

          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(5,150,105,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
            onClick={() => setModal(true)}
          >
            <i className="ti ti-plus text-lg" />
            Nuevo empleado
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          ['Empleados', items.length, 'personal registrado', 'ti-users-group'],
          ['Activos', items.filter(e => e.estado === 'Activo').length, 'habilitados', 'ti-user-check'],
          ['Administradores', items.filter(e => e.cargo === 'Administrador').length, 'control total', 'ti-shield-check'],
          ['Vendedores', items.filter(e => e.cargo === 'Vendedor').length, 'atencion y ventas', 'ti-cash-register'],
        ].map(([label, value, meta, icon], index) => (
          <article
            key={label}
            className="group animate-stat-card-in rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <strong className="mt-2 block text-2xl font-black tracking-tight text-slate-950 group-hover:text-emerald-800">{value}</strong>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition duration-500 group-hover:bg-emerald-600 group-hover:text-white">
                <i className={`ti ${icon} text-xl`} />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {meta}
            </div>
          </article>
        ))}
      </section>

      <section className="animate-dashboard-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] [animation-delay:160ms]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Directorio del personal</h2>
              <p className="mt-1 text-sm text-slate-500">Busca por DNI, nombre o usuario.</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px]">
              <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 transition duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <i className="ti ti-search text-lg text-emerald-700" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Buscar empleado..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>
              <select className={inputClass} value={cargo} onChange={e => setCargo(e.target.value)}>
                {cargos.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4">
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-950 text-[11px] font-black uppercase tracking-[0.12em] text-slate-300">
                    <th className="px-5 py-3.5">Empleado</th>
                    <th className="px-4 py-3.5">DNI</th>
                    <th className="px-4 py-3.5">Cargo</th>
                    <th className="px-4 py-3.5">Usuario</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-sm font-bold text-slate-500">
                        Cargando empleados desde Supabase...
                      </td>
                    </tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-sm font-bold text-slate-500">
                        No hay empleados para mostrar.
                      </td>
                    </tr>
                  ) : filtrados.map((e, index) => (
                    <tr
                      key={e.id}
                      className="group animate-table-row-in text-sm transition duration-300 hover:bg-emerald-50/50 hover:shadow-[inset_4px_0_0_#059669]"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-600 ring-1 ring-slate-200 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                            {e.nombre.slice(0, 2).toUpperCase()}
                          </span>
                          <strong className="font-black text-slate-900 group-hover:text-emerald-800">{e.nombre}</strong>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-black text-slate-700">{e.dni}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700 ring-1 ring-sky-100">{e.cargo}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-500">@{e.usuario}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                          <span className="h-1.5 w-1.5 animate-subtle-pulse rounded-full bg-emerald-500" />
                          {e.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Editar">
                            <i className="ti ti-edit text-lg" />
                          </button>
                          <button
                            className="grid h-9 w-9 place-items-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white"
                            title="Eliminar"
                            onClick={async () => {
                              try {
                                await deleteEmployee(e.id)
                                await loadEmployees()
                              } catch (error) {
                                setErrorMsg(error.message)
                              }
                            }}
                          >
                            <i className="ti ti-trash text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onClick={() => setModal(false)}>
          <form
            className="animate-dashboard-in w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.25)]"
            onSubmit={handleSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Nuevo empleado</h3>
                <p className="mt-1 text-sm text-slate-500">Agrega un usuario operativo al sistema.</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600" onClick={() => setModal(false)}>
                <i className="ti ti-x text-lg" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['dni', 'DNI', '45112233'],
                ['usuario', 'Usuario', 'jlopez'],
                ['nombre', 'Nombre completo', 'Juan Lopez'],
              ].map(([key, label, placeholder]) => (
                <div key={key} className={key === 'nombre' ? 'sm:col-span-2' : ''}>
                  <label className={labelClass}>{label}</label>
                  <input className={inputClass} placeholder={placeholder} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Cargo</label>
                <select className={inputClass} value={form.cargo} onChange={e => setForm(prev => ({ ...prev, cargo: e.target.value }))}>
                  <option>Vendedor</option>
                  <option>Cajera</option>
                  <option>Administrador</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select className={inputClass} value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200" onClick={() => setModal(false)}>
                Cancelar
              </button>
              <button className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700">
                Guardar empleado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
