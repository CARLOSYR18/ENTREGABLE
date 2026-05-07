import { useEffect, useMemo, useState } from 'react'
import { fetchProducts, fetchSales } from '../lib/supabaseData'

const formatCurrency = value =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value)

const csvEscape = value => {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

const salesByHour = [
  { hour: '08:00', value: 28 },
  { hour: '09:00', value: 54 },
  { hour: '10:00', value: 42 },
  { hour: '11:00', value: 76 },
  { hour: '12:00', value: 62 },
  { hour: '13:00', value: 84 },
  { hour: '14:00', value: 58 },
  { hour: '15:00', value: 70 },
]

const operationalCards = [
  { label: 'Meta mensual', value: '78%', detail: 'S/ 18,420 de S/ 23,500', progress: 78 },
  { label: 'Rotacion semanal', value: '+18%', detail: 'categoria medicamentos', progress: 64 },
  { label: 'Ventas completadas', value: '100%', detail: 'sin anulaciones hoy', progress: 100 },
]

export default function Dashboard() {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg('')

      try {
        const [productsResult, salesResult] = await Promise.allSettled([fetchProducts(), fetchSales()])
        const errors = []

        if (productsResult.status === 'fulfilled') {
          setProductos(productsResult.value)
        } else {
          setProductos([])
          errors.push(productsResult.reason?.message || 'No se pudo cargar el inventario.')
        }

        if (salesResult.status === 'fulfilled') {
          setVentas(salesResult.value)
        } else {
          setVentas([])
          errors.push(salesResult.reason?.message || 'No se pudieron cargar las ventas.')
        }

        if (errors.length) {
          setErrorMsg(errors.join(' | '))
        }
      } catch (error) {
        setErrorMsg(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const todaySales = ventas.reduce((total, sale) => total + sale.total, 0)
  const lowStock = productos.filter(product => product.stock <= 20)
  const activeProducts = productos.length
  const receipts = ventas.length
  const averageTicket = receipts ? todaySales / receipts : 0

  const exportSalesCsv = () => {
    if (!ventas.length) return

    const headers = ['Operacion', 'Comprobante', 'Tipo', 'Cliente', 'Fecha', 'Vendedor', 'Total', 'Estado']
    const rows = ventas.map(sale => [
      `Venta #${sale.id}`,
      sale.comprobante,
      sale.tipo,
      sale.cliente,
      sale.fecha,
      sale.vendedor,
      sale.total.toFixed(2),
      sale.estado || 'Completada',
    ])

    const csv = [
      headers.map(csvEscape).join(','),
      ...rows.map(row => row.map(csvEscape).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `dashboard-ultimas-ventas-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const kpis = useMemo(() => [
    {
      label: 'Venta del dia',
      value: formatCurrency(todaySales),
      meta: loading ? 'cargando Supabase' : 'segun ventas registradas',
      icon: 'ti-report-money',
    },
    {
      label: 'Ticket promedio',
      value: formatCurrency(averageTicket),
      meta: `${receipts} comprobantes`,
      icon: 'ti-receipt',
    },
    {
      label: 'Productos activos',
      value: activeProducts,
      meta: 'inventario registrado',
      icon: 'ti-pill',
    },
    {
      label: 'Stock critico',
      value: lowStock.length,
      meta: 'requiere reposicion',
      icon: 'ti-alert-triangle',
    },
  ], [activeProducts, averageTicket, loading, lowStock.length, receipts, todaySales])

  return (
    <div className="space-y-5">
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {errorMsg}
        </div>
      )}
      <section className="animate-dashboard-in rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-2 w-2 animate-subtle-pulse rounded-full bg-emerald-500" />
              Operacion comercial
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Dashboard de ventas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Control diario de caja, comprobantes, inventario critico y rendimiento de tienda.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['Fecha', '05 Mayo 2026'],
              ['Caja', 'Abierta'],
              ['Sucursal', 'Nova Salud'],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="animate-stat-card-in rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                <strong className={`mt-1 block text-sm font-black ${label === 'Caja' ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {kpis.map((item, index) => (
          <article
            key={item.label}
            className="group animate-stat-card-in rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <strong className="mt-2 block text-2xl font-black tracking-tight text-slate-950 transition-colors duration-500 group-hover:text-emerald-800">
                  {item.value}
                </strong>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition duration-500 group-hover:-translate-y-0.5 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_12px_22px_rgba(5,150,105,0.22)]">
                <i className={`ti ${item.icon} text-xl`} />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {item.meta}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 2xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="animate-dashboard-in rounded-lg border border-slate-200 bg-white shadow-sm [animation-delay:120ms]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-950">Ventas por hora</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">Rendimiento acumulado del turno</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                +12%
              </span>
            </div>

            <div className="px-5 py-5">
              <div className="flex h-64 items-end gap-3 border-b border-l border-slate-200 px-2 pb-3">
                {salesByHour.map((item, index) => (
                  <div key={item.hour} className="group flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="relative flex flex-1 items-end">
                      <div
                        className="relative w-full origin-bottom animate-bar-rise overflow-hidden rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400 shadow-[0_10px_20px_rgba(5,150,105,0.16)] transition-[filter,transform] duration-500 ease-out group-hover:scale-x-110 group-hover:from-emerald-800 group-hover:brightness-105"
                        style={{ height: `${item.value}%`, animationDelay: `${220 + index * 85}ms` }}
                        title={`${item.hour}: ${item.value}%`}
                      >
                        <span className="absolute inset-x-0 top-0 h-1 bg-white/35" />
                      </div>
                    </div>
                    <span className="text-center text-[11px] font-bold text-slate-400 transition-colors duration-300 group-hover:text-emerald-700">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="animate-dashboard-in rounded-lg border border-slate-200 bg-white shadow-sm [animation-delay:180ms]">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-black text-slate-950">Indicadores operativos</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Seguimiento de metas y calidad del turno</p>
            </div>

            <div className="space-y-4 p-5">
              {operationalCards.map((item, index) => (
                <div
                  key={item.label}
                  className="group animate-stat-card-in rounded-lg border border-slate-200 bg-slate-50 p-4 transition duration-500 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                  style={{ animationDelay: `${260 + index * 80}ms` }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.label}</p>
                      <span className="mt-1 block text-xs font-medium text-slate-500">{item.detail}</span>
                    </div>
                    <strong className="text-lg font-black text-emerald-700">{item.value}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full animate-progress-sweep rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-[filter] duration-500 group-hover:brightness-110"
                      style={{ '--progress-width': `${item.progress}%`, animationDelay: `${360 + index * 120}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="animate-dashboard-in rounded-lg border border-slate-200 bg-white shadow-sm [animation-delay:240ms]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-black text-slate-950">Inventario critico</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Prioridad de reposicion</p>
            </div>
            <i className="ti ti-alert-triangle text-2xl text-amber-600" />
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-5 py-10 text-center text-sm font-bold text-slate-500">
                Cargando inventario desde Supabase...
              </div>
            ) : lowStock.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <i className="ti ti-circle-check text-2xl" />
                </div>
                <strong className="mt-3 block text-sm font-black text-slate-900">
                  No hay stock critico
                </strong>
                <span className="mt-1 block text-xs font-medium text-slate-500">
                  Los productos estan por encima del minimo configurado.
                </span>
              </div>
            ) : lowStock.map((product, index) => (
              <div
                key={product.id}
                className="animate-table-row-in px-5 py-4 transition-colors duration-300 hover:bg-amber-50/40"
                style={{ animationDelay: `${320 + index * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{product.nombre}</p>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      {product.laboratorio} - vence {product.vence}
                    </span>
                  </div>
                  <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                    {product.stock} und.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="animate-dashboard-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] [animation-delay:300ms]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-600 text-white shadow-[0_12px_24px_rgba(5,150,105,0.22)]">
                <i className="ti ti-receipt-2 text-xl" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-slate-950">Ultimas ventas</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
                    En vivo
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Movimientos recientes del punto de venta y comprobantes emitidos.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
                <strong className="mt-1 block text-sm font-black text-slate-900">{formatCurrency(todaySales)}</strong>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Ventas</span>
                <strong className="mt-1 block text-sm font-black text-slate-900">{receipts}</strong>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                onClick={exportSalesCsv}
                disabled={!ventas.length}
              >
                <i className="ti ti-download text-base" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-950 text-[11px] font-black uppercase tracking-[0.12em] text-slate-300">
                    <th className="px-5 py-3.5">Operacion</th>
                    <th className="px-4 py-3.5">Comprobante</th>
                    <th className="px-4 py-3.5">Cliente</th>
                    <th className="px-4 py-3.5">Fecha</th>
                    <th className="px-4 py-3.5">Vendedor</th>
                    <th className="px-4 py-3.5 text-right">Importe</th>
                    <th className="px-5 py-3.5">Estado</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-sm font-bold text-slate-500">
                        Cargando ultimas ventas desde Supabase...
                      </td>
                    </tr>
                  ) : ventas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                          <i className="ti ti-receipt-off text-3xl" />
                        </div>
                        <strong className="mt-4 block text-base font-black text-slate-900">
                          No hay ventas registradas
                        </strong>
                        <span className="mt-1 block text-sm text-slate-500">
                          Las ventas nuevas apareceran aqui despues de registrarlas.
                        </span>
                      </td>
                    </tr>
                  ) : ventas.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className="group animate-table-row-in text-sm transition-[background,box-shadow] duration-300 hover:bg-emerald-50/50 hover:shadow-[inset_4px_0_0_#059669]"
                      style={{ animationDelay: `${420 + index * 55}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
                            <i className="ti ti-shopping-cart text-lg" />
                          </span>
                          <div>
                            <p className="text-sm font-black text-slate-900 transition-colors duration-300 group-hover:text-emerald-800">
                              Venta #{sale.id}
                            </p>
                            <span className="text-xs font-semibold text-slate-400">{sale.tipo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-black text-slate-800">{sale.comprobante}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[190px] truncate font-bold text-slate-700">{sale.cliente}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{sale.fecha}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.vendedor}</td>
                      <td className="px-4 py-4 text-right">
                        <strong className="text-base font-black text-slate-950 transition-colors duration-300 group-hover:text-emerald-800">
                          {formatCurrency(sale.total)}
                        </strong>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
                          <span className="h-1.5 w-1.5 animate-subtle-pulse rounded-full bg-emerald-500 group-hover:bg-white" />
                          Completado
                        </span>
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
