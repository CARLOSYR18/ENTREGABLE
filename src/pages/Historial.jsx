import { useEffect, useMemo, useState } from 'react'
import { fetchSales } from '../lib/supabaseData'

const formatCurrency = value =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value)

const toInputDate = value => {
  if (!value) return ''
  if (String(value).includes('-')) return String(value).slice(0, 10)

  const [date] = value.split(' ')
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}`
}

const csvEscape = value => {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export default function Historial() {
  const [ventas, setVentas] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg('')

      try {
        setVentas(await fetchSales())
      } catch (error) {
        setErrorMsg(error.message)
        setVentas([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase()

    return ventas.filter(v => {
      const matchTipo = filtroTipo === 'Todos' || v.tipo === filtroTipo
      const matchBusq =
        !term ||
        v.comprobante.toLowerCase().includes(term) ||
        v.cliente.toLowerCase().includes(term) ||
        v.vendedor.toLowerCase().includes(term)
      const matchFecha = !fecha || toInputDate(v.fecha) === fecha

      return matchTipo && matchBusq && matchFecha
    })
  }, [busqueda, fecha, filtroTipo, ventas])

  const totalFiltrado = filtradas.reduce((acc, venta) => acc + venta.total, 0)
  const boletas = filtradas.filter(venta => venta.tipo === 'Boleta').length
  const facturas = filtradas.filter(venta => venta.tipo === 'Factura').length

  const exportarCsv = () => {
    const headers = ['Comprobante', 'Tipo', 'Fecha', 'Cliente', 'Vendedor', 'Total']
    const rows = filtradas.map(v => [
      v.comprobante,
      v.tipo,
      v.fecha,
      v.cliente,
      v.vendedor,
      v.total.toFixed(2),
    ])

    const csv = [
      headers.map(csvEscape).join(','),
      ...rows.map(row => row.map(csvEscape).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `historial-ventas-${fecha || 'todos'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <section className="animate-dashboard-in rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-2 w-2 animate-subtle-pulse rounded-full bg-emerald-500" />
              Registro comercial
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Historial de ventas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulta, filtra y exporta los comprobantes emitidos por el punto de venta.
            </p>
          </div>

          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(5,150,105,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_18px_32px_rgba(5,150,105,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            onClick={exportarCsv}
            disabled={!filtradas.length}
          >
            <i className="ti ti-download text-lg" />
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          ['Ventas filtradas', filtradas.length, 'tiempo real', 'ti-receipt-2'],
          ['Total vendido', formatCurrency(totalFiltrado), 'segun filtros', 'ti-cash-banknote'],
          ['Boletas', boletas, 'comprobantes simples', 'ti-file-description'],
          ['Facturas', facturas, 'comprobantes fiscales', 'ti-file-invoice'],
        ].map(([label, value, meta, icon], index) => (
          <article
            key={label}
            className="group animate-stat-card-in rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <strong className="mt-2 block text-2xl font-black tracking-tight text-slate-950 transition-colors duration-500 group-hover:text-emerald-800">
                  {value}
                </strong>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition duration-500 group-hover:-translate-y-0.5 group-hover:bg-emerald-600 group-hover:text-white">
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
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-emerald-300 shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
                <i className="ti ti-history text-xl" />
              </span>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">Movimientos registrados</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Resultados filtrados por comprobante, cliente, vendedor, fecha y tipo.
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_160px_auto]">
              <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 transition duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <i className="ti ti-search text-lg text-emerald-700" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Buscar comprobante, cliente o vendedor..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
              >
                <option>Todos</option>
                <option>Boleta</option>
                <option>Factura</option>
              </select>

              <input
                type="date"
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />

              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => {
                  setBusqueda('')
                  setFiltroTipo('Todos')
                  setFecha('')
                }}
              >
                <i className="ti ti-filter-off text-lg" />
                Limpiar
              </button>
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
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-950 text-[11px] font-black uppercase tracking-[0.12em] text-slate-300">
                    <th className="px-5 py-3.5">Operacion</th>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Fecha</th>
                    <th className="px-4 py-3.5">Cliente</th>
                    <th className="px-4 py-3.5">Vendedor</th>
                    <th className="px-4 py-3.5 text-right">Total</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-sm font-bold text-slate-500">
                        Cargando historial desde Supabase...
                      </td>
                    </tr>
                  ) : filtradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                          <i className="ti ti-search-off text-3xl" />
                        </div>
                        <strong className="mt-4 block text-base font-black text-slate-900">
                          No se encontraron resultados
                        </strong>
                        <span className="mt-1 block text-sm text-slate-500">
                          Ajusta los filtros o limpia la busqueda.
                        </span>
                      </td>
                    </tr>
                  ) : filtradas.map((venta, index) => (
                    <tr
                      key={venta.id}
                      className="group animate-table-row-in text-sm transition-[background,box-shadow] duration-300 hover:bg-emerald-50/50 hover:shadow-[inset_4px_0_0_#059669]"
                      style={{ animationDelay: `${index * 55}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
                            <i className="ti ti-receipt text-lg" />
                          </span>
                          <div>
                            <p className="font-mono text-sm font-black text-slate-900 transition-colors duration-300 group-hover:text-emerald-800">
                              {venta.comprobante}
                            </p>
                            <span className="text-xs font-semibold text-slate-400">Venta #{venta.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-sm ${
                            venta.tipo === 'Boleta'
                              ? 'bg-sky-50 text-sky-700 ring-sky-100'
                              : 'bg-violet-50 text-violet-700 ring-violet-100'
                          }`}
                        >
                          {venta.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{venta.fecha}</td>
                      <td className="px-4 py-4">
                        <div className="max-w-[210px] truncate font-bold text-slate-700">{venta.cliente}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{venta.vendedor}</td>
                      <td className="px-4 py-4 text-right">
                        <strong className="text-base font-black text-slate-950 transition-colors duration-300 group-hover:text-emerald-800">
                          {formatCurrency(venta.total)}
                        </strong>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Ver detalle">
                            <i className="ti ti-eye text-lg" />
                          </button>
                          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Imprimir">
                            <i className="ti ti-printer text-lg" />
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
    </div>
  )
}
