import { useEffect, useState } from 'react'
import { createSale, fetchProducts } from '../lib/supabaseData'

const IGV_RATE = 0.18

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const getLocalInputDate = () => {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  return localDate.toISOString().slice(0, 10)
}

export default function NuevaVenta({ user, profile }) {
  const [tipoDoc, setTipoDoc] = useState('Boleta')
  const [serie, setSerie] = useState('B001')
  const [fechaVenta, setFechaVenta] = useState(getLocalInputDate)
  const [tipoCliente, setTipoCliente] = useState('0 - Sin documento')
  const [nroDoc, setNroDoc] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteDireccion, setClienteDireccion] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [formaPago, setFormaPago] = useState('Contado')
  const [moneda, setMoneda] = useState('PEN')
  const [busqueda, setBusqueda] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [cart, setCart] = useState([])
  const [totalRecibido, setTotalRecibido] = useState('')
  const [modal, setModal] = useState(null)
  const [saleSnapshot, setSaleSnapshot] = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const tasas = {
    PEN: { label: 'PEN - SOLES', simbolo: 'S/', rate: 1 },
    USD: { label: 'USD - DOLARES', simbolo: '$', rate: 3.75 },
    EUR: { label: 'EUR - EUROS', simbolo: 'EUR', rate: 4.05 },
  }

  const monedaActual = tasas[moneda]

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true)
      setErrorMsg('')

      try {
        setCatalogo(await fetchProducts())
      } catch (error) {
        setErrorMsg(error.message)
        setCatalogo([])
      } finally {
        setLoadingProducts(false)
      }
    }

    load()
  }, [])

  const handleTipoDoc = (tipo) => {
    setTipoDoc(tipo)
    setSerie(tipo === 'Boleta' ? 'B001' : 'F001')
  }

  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.qty, 0)
  const igv = subtotal * IGV_RATE
  const total = subtotal + igv
  const totalConvertido = total / monedaActual.rate
  const vuelto = parseFloat(totalRecibido || 0) - total

  const addProduct = () => {
    if (!catalogo.length) {
      setErrorMsg('No hay productos disponibles desde Supabase.')
      return
    }

    const term = busqueda.trim().toLowerCase()
    const prod = term
      ? catalogo.find(p => p.nombre.toLowerCase().includes(term))
      : catalogo[Math.floor(Math.random() * catalogo.length)]

    if (!prod) return

    setCart(prev => {
      const ex = prev.find(c => c.id === prod.id)
      if (ex) return prev.map(c => c.id === prod.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...prod, qty: 1 }]
    })

    setBusqueda('')
  }

  const removeItem = (id) => setCart(prev => prev.filter(c => c.id !== id))

  const updateQty = (id, val) => {
    const q = Math.max(1, parseInt(val) || 1)
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: q } : c))
  }

  const handleVender = async () => {
    if (!cart.length) {
      alert('Agregue al menos un producto.')
      return
    }

    const num = Math.floor(Math.random() * 9) + 35
    const comprobante = `${serie}-${String(num).padStart(5, '0')}`
    const numero = String(num).padStart(5, '0')
    const snapshot = {
      comprobante,
      numero,
      tipoDoc,
      serie,
      tipoCliente,
      nroDoc,
      clienteNombre,
      clienteDireccion,
      clienteTelefono,
      formaPago,
      moneda,
      monedaActual,
      fecha: fechaVenta,
      items: cart,
      subtotal,
      igv,
      total,
      totalConvertido,
      totalRecibido,
      vuelto,
    }

    setErrorMsg('')

    try {
      await createSale(snapshot, profile?.id_usuario || profile?.id || user?.id)
    } catch (error) {
      setErrorMsg(error.message)
      return
    }

    setSaleSnapshot(snapshot)
    setModal(comprobante)
    setCart([])
    setTotalRecibido('')
    setClienteNombre('')
    setNroDoc('')
    setClienteDireccion('')
    setClienteTelefono('')
  }

  const printReceipt = () => {
    if (!saleSnapshot) return

    const receiptWindow = window.open('', '_blank', 'width=420,height=720')
    if (!receiptWindow) {
      window.print()
      return
    }

    const rows = saleSnapshot.items.map(item => {
      const sub = item.precio * item.qty
      const imp = sub + sub * IGV_RATE

      return `
        <tr>
          <td>
            <strong>${escapeHtml(item.nombre)}</strong>
            <span>${item.qty} x S/ ${item.precio.toFixed(2)}</span>
          </td>
          <td>S/ ${imp.toFixed(2)}</td>
        </tr>
      `
    }).join('')

    receiptWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(saleSnapshot.comprobante)}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8fafc;
              color: #0f172a;
              font-family: Arial, Helvetica, sans-serif;
            }
            .ticket {
              width: 80mm;
              margin: 0 auto;
              background: #fff;
              padding: 18px;
            }
            .brand {
              text-align: center;
              border-bottom: 1px dashed #94a3b8;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .brand h1 {
              margin: 0;
              font-size: 18px;
              letter-spacing: .04em;
            }
            .brand p, .meta p, .thanks {
              margin: 4px 0;
              color: #475569;
              font-size: 11px;
            }
            .doc {
              text-align: center;
              border: 1px solid #0f172a;
              padding: 8px;
              margin-bottom: 12px;
              font-weight: 800;
              font-size: 13px;
            }
            .section {
              border-bottom: 1px dashed #cbd5e1;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .line {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              font-size: 11px;
              margin: 5px 0;
            }
            .line b { text-align: right; }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              text-align: left;
              border-bottom: 1px solid #0f172a;
              padding: 6px 0;
            }
            th:last-child, td:last-child { text-align: right; }
            td {
              vertical-align: top;
              padding: 7px 0;
              border-bottom: 1px dashed #e2e8f0;
            }
            td span {
              display: block;
              color: #64748b;
              margin-top: 2px;
            }
            .total {
              font-size: 15px;
              font-weight: 900;
            }
            .thanks {
              text-align: center;
              margin-top: 14px;
            }
            @media print {
              body { background: #fff; }
              .ticket { width: 80mm; margin: 0; }
              @page { margin: 6mm; }
            }
          </style>
        </head>
        <body>
          <main class="ticket">
            <div class="brand">
              <h1>BOTICA NOVA SALUD</h1>
              <p>RUC 00000000000</p>
              <p>Sistema de ventas</p>
            </div>

            <div class="doc">
              ${escapeHtml(saleSnapshot.tipoDoc).toUpperCase()} ELECTRONICA<br />
              ${escapeHtml(saleSnapshot.comprobante)}
            </div>

            <div class="section meta">
              <div class="line"><span>Fecha</span><b>${escapeHtml(saleSnapshot.fecha)}</b></div>
              <div class="line"><span>Pago</span><b>${escapeHtml(saleSnapshot.formaPago)}</b></div>
              <div class="line"><span>Moneda</span><b>${escapeHtml(saleSnapshot.moneda)}</b></div>
            </div>

            <div class="section meta">
              <p><b>Cliente:</b> ${escapeHtml(saleSnapshot.clienteNombre || 'Sin documento')}</p>
              <p><b>Documento:</b> ${escapeHtml(saleSnapshot.nroDoc || '-')}</p>
              <p><b>Direccion:</b> ${escapeHtml(saleSnapshot.clienteDireccion || '-')}</p>
              <p><b>Telefono:</b> ${escapeHtml(saleSnapshot.clienteTelefono || '-')}</p>
            </div>

            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>

            <div class="section">
              <div class="line"><span>Op. Gravadas</span><b>S/ ${saleSnapshot.subtotal.toFixed(2)}</b></div>
              <div class="line"><span>Subtotal</span><b>S/ ${saleSnapshot.subtotal.toFixed(2)}</b></div>
              <div class="line"><span>IGV 18%</span><b>S/ ${saleSnapshot.igv.toFixed(2)}</b></div>
              <div class="line total"><span>Total</span><b>${escapeHtml(saleSnapshot.monedaActual.simbolo)} ${saleSnapshot.totalConvertido.toFixed(2)}</b></div>
              <div class="line"><span>Recibido</span><b>S/ ${(parseFloat(saleSnapshot.totalRecibido || 0)).toFixed(2)}</b></div>
              <div class="line"><span>Vuelto</span><b>S/ ${saleSnapshot.vuelto >= 0 && saleSnapshot.totalRecibido ? saleSnapshot.vuelto.toFixed(2) : '0.00'}</b></div>
            </div>

            <p class="thanks">Gracias por su compra.</p>
          </main>
          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    receiptWindow.document.close()
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition duration-300 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
  const labelClass = 'mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500'
  const panelClass = 'animate-dashboard-in rounded-xl border border-slate-200 bg-white shadow-sm'

  return (
    <div className="space-y-5">
      <section className="animate-dashboard-in rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-2 w-2 animate-subtle-pulse rounded-full bg-emerald-500" />
              Punto de venta
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Nueva venta</h1>
            <p className="mt-1 text-sm text-slate-500">
              Registra productos, cliente, comprobante y pago desde una sola pantalla.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="animate-stat-card-in rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 [animation-delay:80ms]">
              <span className="block text-[11px] font-black uppercase tracking-wider text-slate-400">Documento</span>
              <strong className="mt-1 block text-sm font-black text-slate-800">{tipoDoc}</strong>
            </div>
            <div className="animate-stat-card-in rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 [animation-delay:140ms]">
              <span className="block text-[11px] font-black uppercase tracking-wider text-slate-400">Items</span>
              <strong className="mt-1 block text-sm font-black text-slate-800">{cart.length}</strong>
            </div>
            <div className="animate-stat-card-in rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 [animation-delay:200ms]">
              <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-600">Estado</span>
              <strong className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-800">
                <i className="ti ti-shield-check text-base" />
                Venta segura
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[1fr_370px]">
        <main className="space-y-5">
          <section className={`${panelClass} overflow-hidden [animation-delay:80ms]`}>
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-600 text-white shadow-[0_12px_24px_rgba(5,150,105,0.22)]">
                    <i className="ti ti-capsule text-xl" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-950">Agregar productos</h2>
                    <p className="mt-1 text-sm text-slate-500">Busca por codigo, nombre o agrega un producto rapido.</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total provisional</span>
                  <strong className="mt-1 block text-sm font-black text-emerald-700">S/ {total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {errorMsg && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition duration-300 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <i className="ti ti-search text-xl text-emerald-700" />
                  <input
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder={loadingProducts ? 'Cargando productos desde Supabase...' : 'Buscar producto...'}
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addProduct()}
                  />
                </div>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(5,150,105,0.20)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_16px_30px_rgba(5,150,105,0.25)] active:translate-y-0"
                  onClick={addProduct}
                >
                  <i className="ti ti-plus text-lg" />
                  Agregar
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-4">
                <div className="animate-stat-card-in [animation-delay:120ms]">
                  <label className={labelClass}>Tipo operacion</label>
                  <select className={inputClass}>
                    <option>0101 - Venta interna</option>
                  </select>
                </div>

                <div className="animate-stat-card-in [animation-delay:170ms]">
                  <label className={labelClass}>Forma de pago</label>
                  <select className={inputClass} value={formaPago} onChange={e => setFormaPago(e.target.value)}>
                    <option>Contado</option>
                    <option>Credito</option>
                  </select>
                </div>

                <div className="animate-stat-card-in [animation-delay:220ms]">
                  <label className={labelClass}>Total recibido</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0.00"
                    value={totalRecibido}
                    onChange={e => setTotalRecibido(e.target.value)}
                  />
                </div>

                <div className="animate-stat-card-in [animation-delay:270ms]">
                  <label className={labelClass}>Vuelto</label>
                  <input className={`${inputClass} bg-slate-50`} readOnly value={vuelto >= 0 && totalRecibido ? vuelto.toFixed(2) : '0.00'} />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-950 text-[11px] font-black uppercase tracking-[0.12em] text-slate-300">
                        <th className="px-5 py-3.5">Producto</th>
                        <th className="px-4 py-3.5">Precio</th>
                        <th className="px-4 py-3.5">Cantidad</th>
                        <th className="px-4 py-3.5 text-right">Importe</th>
                        <th className="px-5 py-3.5 text-right">Accion</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {cart.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-5 py-14 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                              <i className="ti ti-shopping-cart-plus text-3xl" />
                            </div>
                            <strong className="mt-4 block text-base font-black text-slate-900">No hay productos agregados</strong>
                            <span className="mt-1 block text-sm text-slate-500">Busca un producto y presiona agregar.</span>
                          </td>
                        </tr>
                      ) : cart.map((item, index) => {
                        const sub = item.precio * item.qty
                        const imp = sub + sub * IGV_RATE

                        return (
                          <tr
                            key={item.id}
                            className="group animate-table-row-in text-sm transition-[background,box-shadow] duration-300 hover:bg-emerald-50/45 hover:shadow-[inset_4px_0_0_#059669]"
                            style={{ animationDelay: `${index * 55}ms` }}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
                                  <i className="ti ti-pill text-lg" />
                                </span>
                                <div>
                                  <strong className="block font-black text-slate-900 transition-colors duration-300 group-hover:text-emerald-800">
                                    {item.nombre}
                                  </strong>
                                  <span className="text-xs font-semibold text-slate-400">IGV incluido</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-600">S/ {item.precio.toFixed(2)}</td>
                            <td className="px-4 py-4">
                              <input
                                className="h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-black text-slate-800 outline-none transition duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={e => updateQty(item.id, e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-4 text-right">
                              <strong className="text-base font-black text-slate-950 transition-colors duration-300 group-hover:text-emerald-800">
                                S/ {imp.toFixed(2)}
                              </strong>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                className="inline-grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-100 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white hover:ring-rose-600"
                                onClick={() => removeItem(item.id)}
                              >
                                <i className="ti ti-trash text-lg" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className={`${panelClass} overflow-hidden [animation-delay:160ms]`}>
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-emerald-300 ring-1 ring-white/10">
                    <i className="ti ti-file-invoice text-xl" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">Documento y comprador</span>
                    <h2 className="mt-1 text-lg font-black">Comprobante y cliente</h2>
                    <p className="mt-1 text-sm text-slate-300">Toda la informacion fiscal en una sola ficha.</p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 rounded-lg bg-white/10 p-1 xl:w-72">
                  {['Boleta', 'Factura'].map(t => (
                    <button
                      key={t}
                      className={`rounded-md px-4 py-2 text-sm font-black transition duration-300 ${
                        tipoDoc === t
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      onClick={() => handleTipoDoc(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <i className="ti ti-receipt text-lg" />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-700">Datos del comprobante</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Empresa emisora</label>
                    <select className={inputClass}>
                      <option>BOTICA NOVA SALUD EIRL</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Fecha</label>
                    <input className={inputClass} type="date" value={fechaVenta} onChange={e => setFechaVenta(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>Tipo</label>
                    <select className={inputClass} value={tipoDoc} onChange={e => handleTipoDoc(e.target.value)}>
                      <option>Boleta</option>
                      <option>Factura</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Serie</label>
                    <select className={inputClass} value={serie} onChange={e => setSerie(e.target.value)}>
                      {tipoDoc === 'Boleta'
                        ? <><option>B001</option><option>B002</option></>
                        : <><option>F001</option><option>F002</option></>
                      }
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Correlativo</label>
                    <input className={`${inputClass} bg-slate-50`} readOnly value="35" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Moneda</label>
                    <select className={inputClass} value={moneda} onChange={e => setMoneda(e.target.value)}>
                      <option value="PEN">PEN - SOLES</option>
                      <option value="USD">USD - DOLARES</option>
                      <option value="EUR">EUR - EUROS</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                    <i className="ti ti-user text-lg" />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-700">Datos del cliente</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Tipo documento</label>
                    <select className={inputClass} value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}>
                      <option>0 - Sin documento</option>
                      <option>1 - DNI</option>
                      <option>6 - RUC</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Nro. documento</label>
                    <div className="flex gap-2">
                      <input
                        className={inputClass}
                        placeholder="Ingrese numero"
                        value={nroDoc}
                        onChange={e => setNroDoc(e.target.value)}
                      />
                      <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700">
                        <i className="ti ti-search text-lg" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Nombre / Razon social</label>
                    <input
                      className={inputClass}
                      placeholder="Ingrese nombre del cliente"
                      value={clienteNombre}
                      onChange={e => setClienteNombre(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Direccion</label>
                    <input
                      className={inputClass}
                      placeholder="Direccion"
                      value={clienteDireccion}
                      onChange={e => setClienteDireccion(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Telefono</label>
                    <input
                      className={inputClass}
                      placeholder="Telefono"
                      value={clienteTelefono}
                      onChange={e => setClienteTelefono(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="animate-dashboard-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.10)] [animation-delay:180ms]">
            <div className="bg-slate-950 px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">Resumen</span>
                  <h2 className="mt-1 text-xl font-black">Resumen de venta</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-300">{tipoDoc} · {serie}-00035 · {moneda}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-emerald-300 ring-1 ring-white/10">
                  <i className="ti ti-receipt text-2xl" />
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Total a pagar</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
                    {cart.length} items
                  </span>
                </div>
                <strong className="mt-3 block text-4xl font-black tracking-tight text-emerald-950">
                  {monedaActual.simbolo} {totalConvertido.toFixed(2)}
                </strong>
                {moneda !== 'PEN' && <span className="mt-2 block text-sm font-bold text-emerald-700">Equivale a S/ {total.toFixed(2)}</span>}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                {[
                  ['Op. Gravadas', `S/ ${subtotal.toFixed(2)}`],
                  ['Subtotal', `S/ ${subtotal.toFixed(2)}`],
                  ['IGV 18%', `S/ ${igv.toFixed(2)}`],
                  ['Total recibido', `S/ ${(parseFloat(totalRecibido || 0)).toFixed(2)}`],
                  ['Vuelto', `S/ ${vuelto >= 0 && totalRecibido ? vuelto.toFixed(2) : '0.00'}`],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 transition duration-300 hover:bg-slate-50 ${
                      index !== 4 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-500">{label}</span>
                    <b className="text-sm font-black text-slate-900">{value}</b>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pago</span>
                  <b className="mt-1 block text-sm font-black text-slate-800">{formaPago}</b>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Cliente</span>
                  <b className="mt-1 block truncate text-sm font-black text-slate-800">{clienteNombre || 'Sin documento'}</b>
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <label className="flex items-center justify-between gap-2 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <input className="accent-emerald-600" type="radio" name="modo" defaultChecked />
                    Enviar comprobante
                  </span>
                  <i className="ti ti-mail text-slate-400" />
                </label>
                <label className="flex items-center justify-between gap-2 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <input className="accent-emerald-600" type="radio" name="modo" />
                    Solo venta
                  </span>
                  <i className="ti ti-cash text-slate-400" />
                </label>
              </div>

              <div className="mt-5 grid grid-cols-[0.9fr_1.2fr] gap-3">
                <button
                  className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 ring-1 ring-rose-100 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white hover:ring-rose-600"
                  onClick={() => setCart([])}
                >
                  Cancelar
                </button>

                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(5,150,105,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_18px_32px_rgba(5,150,105,0.28)] active:translate-y-0"
                  onClick={handleVender}
                >
                  <i className="ti ti-shopping-cart-check text-lg" />
                  Vender
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div
            className="animate-dashboard-in w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.25)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <i className="ti ti-circle-check text-4xl" />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-950">Venta registrada</h3>
            <div className="mx-auto mt-4 w-fit rounded-lg bg-slate-950 px-4 py-2 font-mono text-sm font-black text-white">
              {modal}
            </div>
            <p className="mt-3 text-sm text-slate-500">El comprobante fue generado correctamente.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition duration-300 hover:bg-slate-50"
                onClick={printReceipt}
              >
                <i className="ti ti-printer text-lg" />
                Imprimir
              </button>

              <button
                className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition duration-300 hover:bg-emerald-700"
                onClick={() => setModal(null)}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
