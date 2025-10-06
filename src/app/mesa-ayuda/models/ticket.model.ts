export interface TicketDashboardDto {
  idTicket: number;
  idUsuarioAfectado: number;
  idUsuarioResponsable: number;
  idResolutorActual: number;
  usuarioResponsable: string;
  usuarioResolutorActual: string;
  usuarioAfectado: string;
  canal: string;
  nombreEmpresa: string;
  categorias: string;
  prioridad: string;
  nivelAtencion: string;
  localidad: string;
  sla: string;
  estado: string;
  fechaCreacion: string;
  proyecto?: string;
}

export interface TicketDetalleDto {
  idTicket: number;
  idUsuarioAfectado: string;
  idResolutorActual: string;
  idUsuarioResponsable: string;
  usuarioAfectado: string;
  usuarioResponsable: string;
  idEmpresa: number;
  nombreEmpresa: string;
  canal: string;
  categorias: string;
  idCategoria1?: number;
  idCategoria2?: number;
  idCategoria3?: number;
  proyecto?: string;
  prioridad: string;
  nivelPrioridad: string;
  localidad: string;
  idLocalidad: string;
  nivelAtencion: string;
  idNivelAtencion: number;
  sla: string;
  idSLA: number;
  estado: string;
  idEstadoTicket: string;
  detalleEvento: string;
  adjuntos?: string;
  idUsuarioCreador: string;
  usuarioCreador: string;
  idUsuarioModificador?: string;
  usuarioModificador?: string;
  fechaCreacion: string;
  fechaModificacion?: string;
  fechaFinalizacion?: string;
  lineasTrabajo: LineaTrabajoDto[];
}

export interface LineaTrabajoDto {
  idTicketLinea?: number; // ID único de la línea para operaciones de actualización
  nroLinea: number;
  // ACTUALIZADO: Separar tiempos proyectado y real
  tiempoHoras: number; // Mantener para compatibilidad
  tiempoProyectado: number; // Tiempo estimado para la línea
  tiempoReal?: number; // Tiempo real que tomó completar la línea
  nivel: string;
  nombreResolutor: string;
  areaResolutor?: string;
  // ACTUALIZADO: Estado por ID numérico y nombre descriptivo
  estado: string; // Mantener para compatibilidad
  idEstadoLinea: number; // ID numérico del estado (1-6)
  nombreEstadoLinea: string; // Nombre descriptivo del estado
  resolucion?: string;
  adjuntos?: string;
  fechaCreacion: string;
  fechaModificacion?: string;
  fechaFinalizacion?: string; // NUEVO: Fecha de finalización de la línea
}

export interface AgregarLineaDto {
  // ACTUALIZADO: Cambiar de tiempo único a tiempo proyectado
  tiempo: number; // Mantener para compatibilidad
  tiempoProyectado: number; // Tiempo estimado para completar la línea
  tiempoReal?: number; // Tiempo real (opcional, se puede establecer después)
  nivel: string;
  idNivelAtencion: number; // NUEVO: ID del nivel de atención
  resolucion?: string;
  adjuntos?: string;
  // ACTUALIZADO: Estado por ID numérico
  estadoDestino: string; // Mantener para compatibilidad
  idEstadoLinea: number; // ID numérico del estado (default: 1 - Iniciado)
  idCategoria1?: number;
  idCategoria2?: number;
  idCategoria3?: number;
  idResolutor: string; // NUEVO: ID del resolutor asignado
}

export interface EditTicketDto {
  idTicket: number;
  idUsuarioResponsable?: string;
  idUsuarioAfectado?: string;
  idResolutorActual?: string;
  idEmpresa?: number;
  idSla?: number;
  idCanal?: number;
  idCategoria1?: string;
  idCategoria2?: string;
  idCategoria3?: string;
  idProyecto?: string;
  idPrioridad?: number;
  idNivelAtencion?: number;
  idLocalidad?: number;
  detalleEvento?: string;
  estado?: string;
}

export interface CrearTicketDto {
  empresaId: number;
  usuarioAfectado: string;
  usuarioResponsable: string;
  categorias: string;
  proyectoId?: number;
  sla: string;
  prioridad: string;
  localidad: string;
  nivelAtencion: string;
  detalleEvento: string;
  canal: string;
}

// export interface UsuarioResponsableDto {
//   idUsuario: string;
//   nombre: string;
//   area?: string;
//   activo: boolean;
// }

// Enums para consistencia
export enum EstadoTicket {
  INGRESADO = 'I',
  ASIGNADO = 'A',
  DESARROLLO = 'D',
  ESCALADO = 'E',
  PRUEBAS = 'P',
  FINALIZADO = 'F',
  CERRADO = 'C',
  DESACTIVADO = 'X'
}

export enum PrioridadTicket {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja'
}

// NUEVOS: Interfaces para funcionalidades adicionales de líneas

export interface ActualizarLineaDto {
  idTicketLinea: number;
  idEstadoLinea?: number;
  tiempoReal?: number;
  resolucion?: string;
}

export interface CrearLineasMultiplesDto {
  idTicket: number;
  lineas: AgregarLineaDto[];
}

export interface CerrarTicketDto {
  idTicket: number;
  idUsuario: string;
}

export enum CanalTicket {
  EMAIL = 'Email',
  TELEFONO = 'Teléfono',
  PRESENCIAL = 'Presencial',
  PORTAL = 'Portal'
}

// NUEVO: Interface para estados de línea de ticket
export interface EstadoTicketLineaDto {
  idEstadoLinea: number;
  nombreEstado: string;
  descripcion: string;
  activo: boolean;
}

// Interfaces para paginación
export interface PaginationRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TicketDashboardPaginatedDto extends PaginatedResponse<TicketDashboardDto> {}

// Parámetros de filtros para el dashboard
export interface DashboardFilters extends PaginationRequest {
  estado?: string;
  prioridad?: string;
  categoria?: string;
  usuarioResponsable?: string;
  idResolutor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}