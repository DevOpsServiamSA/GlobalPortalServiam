// ============================================
// API V2 - DTOs alineados con backend
// ============================================

// Códigos de empresa válidos
export type CodigoEmpresa = 'FILASUR' | 'NK' | 'POLYSOL' | 'SERVIAM' | 'TMI' | 'FATIMA';

// Empresa con código string
export interface EmpresaDto {
  codigo: CodigoEmpresa;
  nombre: string;
  activo: boolean;
}

// Paginación del backend
export interface PaginatedResponseDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Cliente DTO
export interface ClienteDto {
  ruc: string;
  codigo: string;
  razonSocial: string;
  email: string | null;
  activo: boolean;
  saldoLocal: number;
  saldoDolar: number;
  vendedor: string | null;
  cobrador: string | null;
  zona: string | null;
  ruta: string | null;
  ultimoEnvio: string | null; // ISO date string
}

// Filtros para clientes
export interface ClientesFiltrosDto {
  empresa: CodigoEmpresa;
  fechaCorte: string; // ISO date YYYY-MM-DD
  ruc?: string;
  codigo?: string;
  razonSocial?: string;
  activo?: boolean;
  soloConSaldo?: boolean;
  moneda?: 'S/.' | 'USD' | null;
  page?: number;
  pageSize?: number;
  orderBy?: 'RAZON_SOCIAL' | 'CODIGO' | 'RUC' | 'SALDO_LOCAL' | 'SALDO_DOLAR';
  orderDir?: 'ASC' | 'DESC';
}

// Preview estado de cuenta request
export interface PreviewEstadoCuentaRequestDto {
  fechaCorte: string;
  codigosCliente: string[];
  soloConSaldo: boolean;
  moneda: string | null;
}

// Enviar estados de cuenta request
export interface EnviarEstadosCuentaRequestDto {
  fechaCorte: string;
  ruc: string | null;
  codigo: string | null;
  razonSocial: string | null;
  moneda: string | null;
  soloConSaldo: boolean;
  codigosCliente: string[];
  usuario?: string; // Optional, se puede extraer del token
}

// Respuesta de envío iniciado
export interface EnvioIniciadoResponseDto {
  ejecucionId: number;
  totalClientes: number;
  mensaje: string;
  fechaInicio: string;
}

// Historial de envío DTO
export interface HistorialEnvioDto {
  id: number;
  fechaCorte: string;
  fechaInicio: string;
  fechaFin: string | null;
  usuarioCodigo: string;
  usuarioNombre: string | null;
  totalClientes: number;
  totalEnviados: number;
  totalErrores: number;
  totalOmitidos: number;
  filtroRuc: string | null;
  filtroCodigo: string | null;
  filtroRazonSocial: string | null;
  filtroMoneda: string | null;
  filtroSoloConSaldo: boolean;
  estado: string;
  mensajeError: string | null;
  detalles: EnvioDetalleDto[];
}

// Detalle de envío DTO
export interface EnvioDetalleDto {
  id: number;
  codigoCliente: string;
  rucCliente: string;
  razonSocialCliente: string;
  emailDestino: string;
  estado: string; // "Enviado" | "ErrorEnvio" | "Omitido" | "Pendiente"
  fechaGeneracion: string | null;
  fechaEnvio: string | null;
  rutaPdf: string | null;
  tamanioPdf: number | null;
  cantidadDocumentos: number;
  saldoLocal: number;
  saldoDolar: number;
  mensajeError: string | null;
  intentosEnvio: number;
  fechaUltimoIntento: string | null;
}

// Filtros historial
export interface HistorialFiltrosDto {
  empresa: CodigoEmpresa;
  fechaDesde?: string;
  fechaHasta?: string;
  usuario?: string;
  estado?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  orderBy?: 'FechaInicio' | 'FechaCorte' | 'Usuario' | 'Estado' | 'TotalClientes';
  orderDir?: 'ASC' | 'DESC';
}

// Cliente Email DTO
export interface ClienteEmailDto {
  id: number;
  codigoCliente: string;
  email: string;
  esPrincipal: boolean;
  createdBy: string | null;
  createdDate: string;
  modifiedBy: string | null;
  modifiedDate: string | null;
}

// Crear email request
export interface CrearEmailRequestDto {
  codigoCliente: string;
  email: string;
  esPrincipal: boolean;
}

// Actualizar email request
export interface ActualizarEmailRequestDto {
  id: number;
  email: string;
  esPrincipal?: boolean;
}
