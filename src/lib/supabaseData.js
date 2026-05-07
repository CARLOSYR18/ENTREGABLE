import { supabase } from './supabase'

const get = (row, keys, fallback = '') => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) return row[key]
  }
  return fallback
}

const toNumber = value => Number(value ?? 0)

const toDateValue = value => {
  if (!value) return null
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`
  return value
}

const handle = ({ data, error }, table) => {
  if (error) {
    throw new Error(`${table}: ${error.message}`)
  }

  return data || []
}

const isMissingColumnError = (error, column) => {
  const message = String(error?.message || '').toLowerCase()

  return message.includes(column.toLowerCase()) && (message.includes('schema cache') || message.includes('column'))
}

const findIdByName = (rows, idKey, nameKeys, value, fallback = 1) => {
  const term = String(value || '').toLowerCase().trim()
  const found = rows.find(row =>
    nameKeys.some(key => String(row?.[key] || '').toLowerCase().includes(term))
  )

  return found?.[idKey] || rows[0]?.[idKey] || fallback
}

export const normalizeProduct = (product, prices = [], lookups = {}) => {
  const price = prices.find(item => item.id_producto === product.id_producto) || prices[0] || {}
  const laboratory = lookups.laboratorios?.find(item => item.id_laboratorio === product.id_laboratorio)
  const category = lookups.categorias?.find(item => item.id_categoria === product.id_categoria)
  const presentation = lookups.presentaciones?.find(item => item.id_presentacion === product.id_presentacion)

  return {
    id: get(product, ['id_producto', 'id']),
    id_producto: get(product, ['id_producto', 'id']),
    id_producto_precio: get(price, ['id_producto_precio', 'id']),
    nombre: get(product, ['nombre_comercial', 'nombre_producto', 'nombre', 'descripcion', 'producto'], 'Producto sin nombre'),
    laboratorio: laboratory?.nombre_laboratorio || get(product, ['laboratorio', 'marca', 'fabricante'], 'Sin laboratorio'),
    categoria: category?.nombre_categoria || get(product, ['categoria', 'tipo_producto', 'grupo'], 'General'),
    presentacion: presentation?.nombre_presentacion || get(price, ['presentacion', 'unidad_medida', 'tipo_precio'], get(product, ['presentacion'], 'Unidad')),
    precio: toNumber(get(price, ['precio_venta', 'precio', 'precio_unitario'], get(product, ['precio_venta', 'precio'], 0))),
    stock: toNumber(get(product, ['stock_actual_unidades', 'stock', 'stock_actual'], 0)),
    vence: get(product, ['fecha_vencimiento', 'vence', 'fecha_caducidad'], '-'),
    raw: product,
    priceRaw: price,
  }
}

export const normalizeClient = row => ({
  id: get(row, ['id_cliente', 'id']),
  tipo: get(row, ['tipo_documento', 'tipo_doc', 'tipo'], 'DNI'),
  doc: String(get(row, ['numero_documento', 'nro_documento', 'documento', 'doc'], '')),
  nombre: get(row, ['nombres_razon_social', 'nombre_razon_social', 'razon_social', 'nombre_completo', 'nombre'], get(row, ['email'], '') || `Cliente ${get(row, ['numero_documento', 'doc'], '')}`),
  direccion: get(row, ['direccion'], ''),
  telefono: String(get(row, ['telefono', 'celular'], '')),
  estado: get(row, ['estado'], true) === true ? 'Activo' : get(row, ['estado'], 'Activo'),
  raw: row,
})

export const normalizeEmployee = row => ({
  id: get(row, ['id_empleado', 'id_usuario', 'id']),
  dni: String(get(row, ['dni', 'documento', 'numero_documento'], '')),
  nombre: get(row, ['nombre_completo', 'full_name', 'nombre'], `${get(row, ['nombres'], '')} ${get(row, ['apellidos'], '')}`.trim() || 'Empleado sin nombre'),
  cargo: get(row, ['cargo', 'role', 'rol'], 'Vendedor'),
  usuario: get(row, ['usuario', 'username', 'email'], ''),
  estado: get(row, ['estado'], true) === true ? 'Activo' : get(row, ['estado'], 'Activo'),
  raw: row,
})

export const normalizeSale = (row, clients = [], users = []) => {
  const client = clients.find(item => item.id === row.id_cliente)
  const user = users.find(item => item.id === row.id_usuario)
  const serie = get(row, ['serie_documento', 'serie'], '')
  const numero = get(row, ['numero_documento', 'correlativo'], '')

  return {
    id: get(row, ['id_venta', 'id']),
    comprobante: get(row, ['comprobante'], serie && numero ? `${serie}-${numero}` : `Venta #${get(row, ['id_venta', 'id'])}`),
    tipo: get(row, ['tipo_comprobante', 'tipo_documento', 'tipo'], serie?.startsWith('F') ? 'Factura' : 'Boleta'),
    fecha: get(row, ['fecha_venta', 'fecha_emision', 'created_at'], ''),
    cliente: client?.nombre || get(row, ['cliente', 'nombre_cliente'], 'Sin documento'),
    vendedor: user?.nombre || get(row, ['vendedor', 'nombre_usuario'], ''),
    total: toNumber(get(row, ['total', 'total_venta', 'importe_total'], 0)),
    estado: get(row, ['estado'], 'Completada'),
    raw: row,
  }
}

export async function fetchProducts() {
  const products = handle(await supabase.from('Productos').select('*').order('id_producto', { ascending: false }), 'Productos')
  const prices = handle(await supabase.from('Productos_Precios').select('*'), 'Productos_Precios')
  const [laboratorios, categorias, presentaciones] = await Promise.all([
    supabase.from('Laboratorios').select('*').then(result => result.data || []),
    supabase.from('Categorias').select('*').then(result => result.data || []),
    supabase.from('Presentaciones').select('*').then(result => result.data || []),
  ])
  const lookups = { laboratorios, categorias, presentaciones }

  return products.map(product =>
    normalizeProduct(product, prices.filter(price => price.id_producto === product.id_producto), lookups)
  )
}

export async function fetchClients() {
  return handle(await supabase.from('Clientes').select('*').order('id_cliente', { ascending: false }), 'Clientes')
    .map(normalizeClient)
}

export async function fetchEmployees() {
  const cargos = await supabase.from('Cargos').select('*').then(result => result.data || [])
  const employees = await supabase.from('Empleados').select('*').order('id_empleado', { ascending: false })

  if (!employees.error) {
    return (employees.data || []).map(row => {
      const employee = normalizeEmployee(row)
      const cargo = cargos.find(item => item.id_cargo === row.id_cargo)
      return { ...employee, cargo: cargo?.nombre_cargo || employee.cargo }
    })
  }

  return handle(await supabase.from('Usuarios').select('*').order('id_usuario', { ascending: false }), 'Usuarios')
    .map(normalizeEmployee)
}

export async function fetchSales() {
  const sales = handle(await supabase.from('Ventas').select('*').order('id_venta', { ascending: false }), 'Ventas')
  const clients = await fetchClients().catch(() => [])
  const users = await fetchEmployees().catch(() => [])

  return sales.map(row => normalizeSale(row, clients, users))
}

export async function createProduct(form) {
  const [laboratorios, categorias, presentaciones] = await Promise.all([
    supabase.from('Laboratorios').select('*').then(result => result.data || []),
    supabase.from('Categorias').select('*').then(result => result.data || []),
    supabase.from('Presentaciones').select('*').then(result => result.data || []),
  ])

  const payload = {
    id_laboratorio: findIdByName(laboratorios, 'id_laboratorio', ['nombre_laboratorio'], form.laboratorio),
    id_categoria: findIdByName(categorias, 'id_categoria', ['nombre_categoria'], form.categoria),
    id_presentacion: findIdByName(presentaciones, 'id_presentacion', ['nombre_presentacion'], form.presentacion),
    codigo_barras: form.codigo_barras || null,
    nombre_comercial: form.nombre,
    principio_activo: form.nombre,
    descripcion: form.descripcion || form.nombre,
    stock_actual_unidades: toNumber(form.stock),
    stock_minimo_unidades: 10,
    stock_maximo_unidades: 1000,
    fecha_vencimiento: toDateValue(form.vence),
    estado: true,
  }

  const { data: product, error } = await supabase.from('Productos').insert(payload).select('*').single()

  if (error) throw new Error(`Productos: ${error.message}`)

  if (form.precio) {
    await supabase.from('Productos_Precios').insert({
      id_producto: product.id_producto,
      id_unidad: 1,
      precio_compra: toNumber(form.precio) * 0.7,
      precio_venta: toNumber(form.precio),
      id_moneda: 1,
      cantidad_equivalente: 1,
      estado: true,
    })
  }

  return product
}

export async function createClient(form) {
  const payload = {
    tipo_documento: form.tipo,
    numero_documento: form.doc,
    nombres_razon_social: form.nombre,
    direccion: form.direccion,
    telefono: form.telefono,
    email: form.email || '',
    estado: true,
  }

  const { data, error } = await supabase.from('Clientes').insert(payload).select('*').single()

  if (error) throw new Error(`Clientes: ${error.message}`)

  return normalizeClient(data)
}

export async function createEmployee(form) {
  const cargos = await supabase.from('Cargos').select('*').then(result => result.data || [])
  const parts = form.nombre.trim().split(/\s+/)
  const nombres = parts.slice(0, Math.max(1, parts.length - 1)).join(' ')
  const apellidos = parts.length > 1 ? parts.slice(-1).join(' ') : ''

  const payload = {
    dni: form.dni,
    nombres,
    apellidos,
    id_cargo: findIdByName(cargos, 'id_cargo', ['nombre_cargo'], form.cargo),
    fecha_contratacion: new Date().toISOString().slice(0, 10),
    estado: form.estado === 'Activo',
  }

  const inserted = await supabase.from('Empleados').insert(payload).select('*').single()

  if (!inserted.error) return normalizeEmployee(inserted.data)

  throw new Error(`Empleados: ${inserted.error.message}`)
}

export async function createSale(sale, authUserId) {
  const parsedUserId = Number(authUserId)
  const comprobantes = await supabase.from('Tipos_Comprobantes').select('*')
  const tipo = (comprobantes.data || []).find(row => {
    const nombre = String(get(row, ['nombre_documento', 'nombre', 'descripcion', 'tipo_comprobante', 'codigo'], '')).toLowerCase()
    return nombre.includes(String(sale.tipoDoc).toLowerCase()) || String(get(row, ['serie_actual', 'serie'], '')).startsWith(sale.serie?.[0])
  })

  const ventaPayload = {
    id_tipo_comprobante: get(tipo, ['id_tipo_comprobante', 'id'], sale.tipoDoc === 'Factura' ? 2 : 1),
    id_usuario: Number.isInteger(parsedUserId) ? parsedUserId : null,
    serie_documento: sale.serie,
    numero_documento: sale.numero,
    fecha_venta: sale.fecha,
    subtotal: sale.subtotal,
    igv: sale.igv,
    total: sale.total,
    estado: 'Completada',
    id_moneda: sale.moneda === 'USD' ? 2 : sale.moneda === 'EUR' ? 3 : 1,
  }

  let insertedSale = await supabase.from('Ventas').insert(ventaPayload).select('*').single()

  if (insertedSale.error && isMissingColumnError(insertedSale.error, 'fecha_venta')) {
    const { fecha_venta, ...fallbackPayload } = ventaPayload
    insertedSale = await supabase.from('Ventas').insert(fallbackPayload).select('*').single()
  }

  const { data: venta, error } = insertedSale

  if (error) throw new Error(`Ventas: ${error.message}`)

  const idVenta = get(venta, ['id_venta', 'id'])
  const details = sale.items.map(item => {
    const sub = item.precio * item.qty

    return {
      id_venta: idVenta,
      id_producto: item.id_producto || item.id,
      id_producto_precio: item.id_producto_precio,
      cantidad: item.qty,
      precio_unitario: item.precio,
      subtotal: sub,
    }
  })

  const { error: detailError } = await supabase.from('Detalle_Ventas').insert(details)

  if (detailError) throw new Error(`Detalle_Ventas: ${detailError.message}`)

  return venta
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('Productos').delete().eq('id_producto', id)
  if (error) throw new Error(`Productos: ${error.message}`)
}

export async function deleteClient(id) {
  const { error } = await supabase.from('Clientes').delete().eq('id_cliente', id)
  if (error) throw new Error(`Clientes: ${error.message}`)
}

export async function deleteEmployee(id) {
  const employee = await supabase.from('Empleados').delete().eq('id_empleado', id)
  if (!employee.error) return

  const user = await supabase.from('Usuarios').delete().eq('id_usuario', id)
  if (user.error) throw new Error(`Usuarios: ${user.error.message}`)
}
