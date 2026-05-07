import { useState } from 'react'
import { productos as catalogo } from '../data/mockData'

const IGV_RATE = 0.18

export default function NuevaVenta() {
  const [tipoDoc, setTipoDoc] = useState('Boleta')
  const [serie, setSerie] = useState('B001')
  const [tipoCliente, setTipoCliente] = useState('0 - Sin documento')
  const [nroDoc, setNroDoc] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteDireccion, setClienteDireccion] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [formaPago, setFormaPago] = useState('Contado')
  const [moneda, setMoneda] = useState('PEN')
  const [busqueda, setBusqueda] = useState('')
  const [cart, setCart] = useState([])
  const [totalRecibido, setTotalRecibido] = useState('')
  const [modal, setModal] = useState(null)

  const tasas = {
    PEN: { label: 'PEN - SOLES', simbolo: 'S/', rate: 1 },
    USD: { label: 'USD - DÓLARES', simbolo: '$', rate: 3.75 },
    EUR: { label: 'EUR - EUROS', simbolo: '€', rate: 4.05 },
  }

  const monedaActual = tasas[moneda]

  const handleTipoDoc = (tipo) => {
    setTipoDoc(tipo)
    setSerie(tipo === 'Boleta' ? 'B001' : 'F001')
  }

  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.qty, 0)
  const igv = subtotal * IGV_RATE
  const total = subtotal + igv
  const totalConvertido = total / monedaActual.rate
  const vuelto = parseFloat(totalRecibido || 0) - total
  const today = new Date().toISOString().split('T')[0]

  const addProduct = () => {
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

  const handleVender = () => {
    if (!cart.length) {
      alert('Agregue al menos un producto.')
      return
    }

    const num = Math.floor(Math.random() * 9) + 35
    setModal(`${serie}-${String(num).padStart(5, '0')}`)
    setCart([])
    setTotalRecibido('')
    setClienteNombre('')
    setNroDoc('')
    setClienteDireccion('')
    setClienteTelefono('')
  }

  return (
    <div className="pos-page">
      <div className="pos-header">
        <div>
          <span className="pos-kicker">Punto de venta</span>
          <h1>Nueva venta</h1>
          <p>Registra productos, cliente y comprobante en una sola pantalla.</p>
        </div>

        <div className="pos-header-actions">
          <div className="pos-secure">
            <i className="ti ti-shield-check" />
            Venta segura
          </div>
        </div>
      </div>

      <div className="pos-layout">
        <main className="pos-main">
          <section className="pos-panel pos-product-panel">
            <div className="pos-panel-head">
              <div>
                <h2>Agregar productos</h2>
                <p>Busca por código o nombre del medicamento.</p>
              </div>
              <i className="ti ti-capsule" />
            </div>

            <div className="pos-search">
              <i className="ti ti-search" />
              <input
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addProduct()}
              />
              <button onClick={addProduct}>
                <i className="ti ti-plus" />
                Agregar
              </button>
            </div>

            <div className="pos-sale-options">
              <div>
                <label>Tipo operación</label>
                <select>
                  <option>0101 - Venta interna</option>
                </select>
              </div>

              <div>
                <label>Forma de pago</label>
                <select value={formaPago} onChange={e => setFormaPago(e.target.value)}>
                  <option>Contado</option>
                  <option>Crédito</option>
                </select>
              </div>

              <div>
                <label>Total recibido</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={totalRecibido}
                  onChange={e => setTotalRecibido(e.target.value)}
                />
              </div>

              <div>
                <label>Vuelto</label>
                <input readOnly value={vuelto >= 0 && totalRecibido ? vuelto.toFixed(2) : '0.00'} />
              </div>
            </div>

            <div className="pos-table-wrap">
              <table className="pos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cant.</th>
                    <th>Importe</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="pos-empty">
                        <i className="ti ti-shopping-cart-plus" />
                        <strong>No hay productos agregados</strong>
                        <span>Busca un producto y presiona agregar.</span>
                      </td>
                    </tr>
                  ) : cart.map(item => {
                    const sub = item.precio * item.qty
                    const imp = sub + sub * IGV_RATE

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.nombre}</strong>
                          <span>IGV incluido</span>
                        </td>
                        <td>S/ {item.precio.toFixed(2)}</td>
                        <td>
                          <input
                            className="pos-qty"
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => updateQty(item.id, e.target.value)}
                          />
                        </td>
                        <td><strong>S/ {imp.toFixed(2)}</strong></td>
                        <td>
                          <button className="pos-delete" onClick={() => removeItem(item.id)}>
                            <i className="ti ti-trash" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pos-two-cols">
            <div className="pos-panel">
              <div className="pos-panel-head">
                <div>
                  <h2>Comprobante</h2>
                  <p>Datos fiscales de la venta.</p>
                </div>
                <i className="ti ti-file-invoice" />
              </div>

              <div className="doc-switch">
                {['Boleta', 'Factura'].map(t => (
                  <button
                    key={t}
                    className={tipoDoc === t ? 'active' : ''}
                    onClick={() => handleTipoDoc(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="pos-form-grid">
                <div className="field span-2">
                  <label>Empresa emisora</label>
                  <select>
                    <option>BOTICA NOVA SALUD EIRL</option>
                  </select>
                </div>

                <div className="field">
                  <label>Fecha</label>
                  <input type="date" defaultValue={today} />
                </div>

                <div className="field">
                  <label>Tipo</label>
                  <select value={tipoDoc} onChange={e => handleTipoDoc(e.target.value)}>
                    <option>Boleta</option>
                    <option>Factura</option>
                  </select>
                </div>

                <div className="field">
                  <label>Serie</label>
                  <select value={serie} onChange={e => setSerie(e.target.value)}>
                    {tipoDoc === 'Boleta'
                      ? <><option>B001</option><option>B002</option></>
                      : <><option>F001</option><option>F002</option></>
                    }
                  </select>
                </div>

                <div className="field">
                  <label>Correlativo</label>
                  <input readOnly value="35" />
                </div>

                <div className="field span-2">
                  <label>Moneda</label>
                  <select value={moneda} onChange={e => setMoneda(e.target.value)}>
                    <option value="PEN">PEN - SOLES</option>
                    <option value="USD">USD - DÓLARES</option>
                    <option value="EUR">EUR - EUROS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pos-panel">
              <div className="pos-panel-head">
                <div>
                  <h2>Cliente</h2>
                  <p>Datos del comprador.</p>
                </div>
                <i className="ti ti-user" />
              </div>

              <div className="pos-form-grid">
                <div className="field">
                  <label>Tipo documento</label>
                  <select value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}>
                    <option>0 - Sin documento</option>
                    <option>1 - DNI</option>
                    <option>6 - RUC</option>
                  </select>
                </div>

                <div className="field with-button">
                  <label>Nro. documento</label>
                  <div>
                    <input
                      placeholder="Ingrese número"
                      value={nroDoc}
                      onChange={e => setNroDoc(e.target.value)}
                    />
                    <button>
                      <i className="ti ti-search" />
                    </button>
                  </div>
                </div>

                <div className="field span-2">
                  <label>Nombre / Razón social</label>
                  <input
                    placeholder="Ingrese nombre del cliente"
                    value={clienteNombre}
                    onChange={e => setClienteNombre(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Dirección</label>
                  <input
                    placeholder="Dirección"
                    value={clienteDireccion}
                    onChange={e => setClienteDireccion(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Teléfono</label>
                  <input
                    placeholder="Teléfono"
                    value={clienteTelefono}
                    onChange={e => setClienteTelefono(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="pos-summary">
          <div className="summary-card">
            <div className="summary-head">
              <span>Resumen de venta</span>
              <i className="ti ti-calculator" />
            </div>

            <div className="summary-total">
              <small>Total a pagar</small>
              <strong>{monedaActual.simbolo} {totalConvertido.toFixed(2)}</strong>
              {moneda !== 'PEN' && <span>Equivale a S/ {total.toFixed(2)}</span>}
            </div>

            <div className="summary-lines">
              <div><span>Op. Gravadas</span><b>S/ {subtotal.toFixed(2)}</b></div>
              <div><span>Subtotal</span><b>S/ {subtotal.toFixed(2)}</b></div>
              <div><span>IGV 18%</span><b>S/ {igv.toFixed(2)}</b></div>
              <div><span>Productos</span><b>{cart.length}</b></div>
              <div><span>Moneda</span><b>{moneda}</b></div>
            </div>

            <div className="send-options">
              <label>
                <input type="radio" name="modo" defaultChecked />
                Enviar comprobante
              </label>
              <label>
                <input type="radio" name="modo" />
                Solo venta
              </label>
            </div>

            <div className="summary-actions">
              <button className="cancel" onClick={() => setCart([])}>
                Cancelar
              </button>

              <button className="sell" onClick={handleVender}>
                <i className="ti ti-shopping-cart-check" />
                Vender
              </button>
            </div>
          </div>
        </aside>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">✅</div>
            <h3>¡Venta registrada!</h3>
            <div className="modal-comprobante">{modal}</div>
            <p>El comprobante fue generado correctamente.</p>

            <div className="modal-actions">
              <button className="btn" onClick={() => setModal(null)}>
                <i className="ti ti-printer" />
                Imprimir
              </button>

              <button className="btn btn-primary" onClick={() => setModal(null)}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}