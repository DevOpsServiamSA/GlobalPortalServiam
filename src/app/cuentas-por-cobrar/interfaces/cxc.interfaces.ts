// Cuentas por Cobrar - TypeScript Interfaces

export interface EmpresaCxC {
  id: number;
  razonSocial: string;
  ruc: string;
  direccion?: string;
  activo: boolean;
}

export interface ResumenCuenta {
  empresaId: number;
  empresaNombre: string;
  totalDeuda: number;
  deudaVencida: number;
  deudaPorVencer: number;
  saldoFavor: number;
  ultimoMovimiento: Date;
  diasMorosidad: number;
}

export type TipoDocumento = 'FACTURA' | 'NOTA_DEBITO' | 'NOTA_CREDITO';
export type EstadoDocumento = 'PENDIENTE' | 'VENCIDO' | 'PAGADO' | 'PARCIALMENTE_PAGADO';
export type Moneda = 'PEN' | 'USD';

export interface DetalleDeuda {
  id: number;
  empresaId: number;
  numeroDocumento: string;
  tipoDocumento: TipoDocumento;
  fechaEmision: Date;
  fechaVencimiento: Date;
  montoOriginal: number;
  montoPendiente: number;
  montoPagado: number;
  moneda: Moneda;
  estado: EstadoDocumento;
  diasVencidos: number;
  descripcion?: string;
}

export interface HistorialPago {
  id: number;
  empresaId: number;
  documentoRelacionado: string;
  fechaPago: Date;
  montoPagado: number;
  moneda: Moneda;
  metodoPago: string;
  numeroOperacion?: string;
  observaciones?: string;
}

export interface FiltrosDetalleDeuda {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoDocumento?: TipoDocumento;
  estado?: EstadoDocumento;
  moneda?: Moneda;
}

export interface FiltrosHistorialPagos {
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
