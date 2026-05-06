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
  const [busqueda, setBusqueda] = useState('')
  const [cart, setCart] = useState([])
  const [totalRecibido, setTotalRecibido] = useState('')
  const [modal, setModal] = useState(null)

  const handleTipoDoc = (tipo) => {
    setTipoDoc(tipo)
    setSerie(tipo === 'Boleta' ? 'B001' : 'F001')
  }

  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.qty, 0)
  const igv = subtotal * IGV_RATE
  const total = subtotal + igv
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
    <div className="sale-page fade-in">
      <div className="sale-header">
        <div>
          <h1>Nueva venta</h1>
          <p>Registra ventas, comprobantes y productos de forma rápida.</p>
        </div>

        <div className="sale-status">
          <i className="ti ti-shield-check" />
          Venta segura
        </div>
      </div>

      <div className="sale-mode-card">
        <div className="notice clean">
          <i className="ti ti-info-circle" />
          Los datos se guardarán en Supabase al conectar la base de datos.
        </div>

        <div className="sale-toolbar">
          <div className="tabs-bar sale-tabs">
            {['Boleta', 'Factura'].map(t => (
              <button
                key={t}
                className={`tab-btn ${tipoDoc === t ? 'active' : ''}`}
                onClick={() => handleTipoDoc(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="radio-group modern">
            <label className="radio-opt">
              <input type="radio" name="modo" defaultChecked />
              <span>Generar y enviar comprobante</span>
            </label>

            <label className="radio-opt">
              <input type="radio" name="modo" />
              <span>Solo generar venta</span>
            </label>
          </div>
        </div>
      </div>

      <div className="venta-top">
        <div className="card sale-card">
          <div className="card-title">
            <div>
              <span>Comprobante de pago</span>
              <p>Datos principales de emisión</p>
            </div>
            <i className="ti ti-file-invoice" />
          </div>

          <div className="form-group">
            <div className="form-label"><i className="ti ti-building" /> Empresa emisora</div>
            <select className="form-control">
              <option>BOTICA NOVA SALUD EIRL</option>
            </select>
          </div>

          <div className="form-row cols-2">
            <div className="form-group">
              <div className="form-label"><i className="ti ti-calendar" /> Fecha emisión</div>
              <input type="date" className="form-control" defaultValue={today} />
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-file-text" /> Tipo comprobante</div>
              <select className="form-control" value={tipoDoc} onChange={e => handleTipoDoc(e.target.value)}>
                <option>Boleta</option>
                <option>Factura</option>
              </select>
            </div>
          </div>

          <div className="form-row cols-3">
            <div className="form-group">
              <div className="form-label"><i className="ti ti-hash" /> Serie</div>
              <select className="form-control" value={serie} onChange={e => setSerie(e.target.value)}>
                {tipoDoc === 'Boleta'
                  ? <><option>B001</option><option>B002</option></>
                  : <><option>F001</option><option>F002</option></>
                }
              </select>
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-list-numbers" /> Correlativo</div>
              <input className="form-control" readOnly value="35" />
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-currency-dollar" /> Moneda</div>
              <select className="form-control">
                <option>PEN - SOLES</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card sale-card">
          <div className="card-title">
            <div>
              <span>Datos del cliente</span>
              <p>Información del comprador</p>
            </div>
            <i className="ti ti-user" />
          </div>

          <div className="form-row cols-2">
            <div className="form-group">
              <div className="form-label"><i className="ti ti-id-badge" /> Tipo documento</div>
              <select className="form-control" value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}>
                <option>0 - Sin documento</option>
                <option>1 - DNI</option>
                <option>6 - RUC</option>
              </select>
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-search" /> Nro. documento</div>
              <div className="input-action">
                <input
                  className="form-control"
                  placeholder="Ingrese número"
                  value={nroDoc}
                  onChange={e => setNroDoc(e.target.value)}
                />
                <button className="btn btn-primary compact">
                  <i className="ti ti-search" />
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="form-label"><i className="ti ti-user-circle" /> Nombre / Razón social</div>
            <input
              className="form-control"
              placeholder="Ingrese nombre del cliente"
              value={clienteNombre}
              onChange={e => setClienteNombre(e.target.value)}
            />
          </div>

          <div className="form-row cols-2">
            <div className="form-group">
              <div className="form-label"><i className="ti ti-map-pin" /> Dirección</div>
              <input
                className="form-control"
                placeholder="Dirección"
                value={clienteDireccion}
                onChange={e => setClienteDireccion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-phone" /> Teléfono</div>
              <input
                className="form-control"
                placeholder="Teléfono"
                value={clienteTelefono}
                onChange={e => setClienteTelefono(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="venta-bottom">
        <div className="card sale-card products-card">
          <div className="card-title">
            <div>
              <span>Listado de productos</span>
              <p>Agrega productos a la venta actual</p>
            </div>
            <i className="ti ti-list" />
          </div>

          <div className="product-search">
            <i className="ti ti-search" />
            <input
              placeholder="Ingrese código o nombre del producto"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProduct()}
            />
            <button className="btn btn-primary" onClick={addProduct}>
              <i className="ti ti-plus" />
              Agregar
            </button>
          </div>

          <div className="form-row cols-4 payment-row">
            <div className="form-group">
              <div className="form-label"><i className="ti ti-category" /> Tipo operación</div>
              <select className="form-control">
                <option>0101 - Venta interna</option>
              </select>
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-wallet" /> Forma de pago</div>
              <select className="form-control" value={formaPago} onChange={e => setFormaPago(e.target.value)}>
                <option>Contado</option>
                <option>Crédito</option>
              </select>
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-cash" /> Total recibido</div>
              <input
                className="form-control"
                type="number"
                placeholder="0.00"
                value={totalRecibido}
                onChange={e => setTotalRecibido(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label"><i className="ti ti-arrows-exchange" /> Vuelto</div>
              <input className="form-control" readOnly value={vuelto >= 0 && totalRecibido ? vuelto.toFixed(2) : '0.00'} />
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table sale-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Precio unit.</th>
                  <th>Cant.</th>
                  <th>Subtotal</th>
                  <th>IGV</th>
                  <th>Importe</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      <i className="ti ti-shopping-cart" />
                      Ningún producto agregado aún
                    </td>
                  </tr>
                ) : cart.map(item => {
                  const sub = item.precio * item.qty
                  const igvItem = sub * IGV_RATE
                  const imp = sub + igvItem

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800 }}>{item.nombre}</td>
                      <td>S/ {item.precio.toFixed(2)}</td>
                      <td>
                        <input
                          className="qty-input"
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={e => updateQty(item.id, e.target.value)}
                        />
                      </td>
                      <td>S/ {sub.toFixed(2)}</td>
                      <td>S/ {igvItem.toFixed(2)}</td>
                      <td style={{ fontWeight: 900 }}>S/ {imp.toFixed(2)}</td>
                      <td>
                        <button className="icon-btn danger" onClick={() => removeItem(item.id)}>
                          <i className="ti ti-trash" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card resumen-card">
          <div className="card-title">
            <div>
              <span>Resumen</span>
              <p>Total de la venta</p>
            </div>
            <i className="ti ti-calculator" />
          </div>

          <div className="resumen-body">
            <div className="resumen-row"><span>Op. Gravadas</span><strong>S/ {subtotal.toFixed(2)}</strong></div>
            <div className="resumen-row"><span>Op. Inafectas</span><strong>S/ 0.00</strong></div>
            <div className="resumen-row"><span>Op. Exoneradas</span><strong>S/ 0.00</strong></div>
            <div className="resumen-row"><span>Subtotal</span><strong>S/ {subtotal.toFixed(2)}</strong></div>
            <div className="resumen-row"><span>IGV (18%)</span><strong>S/ {igv.toFixed(2)}</strong></div>
          </div>

          <div className="resumen-total">
            <span className="label">TOTAL</span>
            <span className="amount">S/ {total.toFixed(2)}</span>
          </div>

          <div className="btn-actions">
            <button className="btn btn-danger" onClick={() => setCart([])}>
              <i className="ti ti-x" />
              Cancelar
            </button>

            <button className="btn btn-primary" onClick={handleVender}>
              <i className="ti ti-shopping-cart-check" />
              Vender
            </button>
          </div>
        </div>
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