export const productos = [
  { id: 1, nombre: 'Paracetamol 500mg', laboratorio: 'Portugal', categoria: 'Analgésico', presentacion: 'Pastilla', precio: 0.50, stock: 320, vence: '2027-01' },
  { id: 2, nombre: 'Diclofenaco 75mg', laboratorio: 'Pharma', categoria: 'Antiinflamatorio', presentacion: 'Inyectable', precio: 3.20, stock: 18, vence: '2026-09' },
  { id: 3, nombre: 'Amoxicilina 500mg', laboratorio: 'Hersil', categoria: 'Antibiótico', presentacion: 'Cápsula', precio: 1.20, stock: 150, vence: '2026-12' },
  { id: 4, nombre: 'Omeprazol 20mg', laboratorio: 'Abott', categoria: 'Gastro', presentacion: 'Cápsula', precio: 0.80, stock: 5, vence: '2026-07' },
  { id: 5, nombre: 'Ibuprofeno 400mg', laboratorio: 'Portugal', categoria: 'Analgésico', presentacion: 'Pastilla', precio: 0.60, stock: 210, vence: '2027-03' },
  { id: 6, nombre: 'Loratadina 10mg', laboratorio: 'Hersil', categoria: 'Antihistamínico', presentacion: 'Pastilla', precio: 0.90, stock: 88, vence: '2027-06' },
  { id: 7, nombre: 'Metformina 850mg', laboratorio: 'Abott', categoria: 'Antidiabético', presentacion: 'Pastilla', precio: 1.10, stock: 45, vence: '2027-02' },
  { id: 8, nombre: 'Azitromicina 500mg', laboratorio: 'Pharma', categoria: 'Antibiótico', presentacion: 'Cápsula', precio: 4.50, stock: 3, vence: '2026-08' },
]

export const clientes = [
  { id: 1, tipo: 'DNI', doc: '45782310', nombre: 'Carlos Mamani Quispe', direccion: 'Av. Arequipa 1020', telefono: '987654321' },
  { id: 2, tipo: 'RUC', doc: '20512345678', nombre: 'RVM Maquinarias S.A.C.', direccion: 'Calle Angamos 123', telefono: '014445566' },
  { id: 3, tipo: 'DNI', doc: '31456789', nombre: 'María Torres Paz', direccion: 'Jr. Huallaga 456', telefono: '976543210' },
  { id: 4, tipo: 'RUC', doc: '20432156789', nombre: 'Clínica San Pablo', direccion: 'Av. Javier Prado 1234', telefono: '014001234' },
]

export const empleados = [
  { id: 1, dni: '45112233', nombre: 'Juan Ríos Castillo', cargo: 'Vendedor', usuario: 'jrios', estado: 'Activo' },
  { id: 2, dni: '33445566', nombre: 'Ana Vargas Llanos', cargo: 'Cajera', usuario: 'avargas', estado: 'Activo' },
  { id: 3, dni: '22334455', nombre: 'Carlos Mendoza Pinto', cargo: 'Administrador', usuario: 'cmendoza', estado: 'Activo' },
]

export const ventas = [
  { id: 34, comprobante: 'B001-00034', tipo: 'Boleta', fecha: '05/05/2026 09:14', cliente: 'Carlos Mamani', vendedor: 'Juan Ríos', total: 45.50 },
  { id: 33, comprobante: 'F001-00012', tipo: 'Factura', fecha: '05/05/2026 08:47', cliente: 'RVM Maquinarias SAC', vendedor: 'Juan Ríos', total: 210.80 },
  { id: 32, comprobante: 'B001-00033', tipo: 'Boleta', fecha: '05/05/2026 08:20', cliente: 'Sin documento', vendedor: 'Juan Ríos', total: 12.00 },
  { id: 31, comprobante: 'B001-00032', tipo: 'Boleta', fecha: '04/05/2026 17:55', cliente: 'María Torres', vendedor: 'Ana Vargas', total: 33.20 },
  { id: 30, comprobante: 'F001-00011', tipo: 'Factura', fecha: '04/05/2026 16:30', cliente: 'Clínica San Pablo', vendedor: 'Ana Vargas', total: 520.00 },
]
