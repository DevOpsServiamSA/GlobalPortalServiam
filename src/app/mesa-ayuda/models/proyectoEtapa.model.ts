export interface ProyectoEtapaDto {
  idProyectoEtapa: number;
  idProyecto: string;
  idEtapa: string | null;
  nombre: string;
  orden: number;
  esBase: boolean;
  activo: boolean;
  fechaInicioPlaneada?: string | null;
  fechaFinPlaneada?: string | null;
  horasPlaneadas?: number | null;
  fechaCreacion?: string | null;
  fechaModificacion?: string | null;
  cantidadLineas: number;
}

export interface UpsertEtapaItemRequest {
  idProyectoEtapa?: number | null;
  idEtapa?: string | null;
  nombre: string;
  orden: number;
  esBase: boolean;
  fechaInicioPlaneada?: string | null;
  fechaFinPlaneada?: string | null;
  horasPlaneadas?: number | null;
  eliminar?: boolean;
}

export interface UpsertEtapasProyectoRequest {
  etapas: UpsertEtapaItemRequest[];
  crearVersion: boolean;
  motivoVersion?: string | null;
}

export interface ProyectoEtapaVersionDto {
  idVersion: number;
  idProyecto: string;
  versionNumero: number;
  motivo?: string | null;
  idUsuarioCreador: string;
  fechaCreacion: string;
  cantidadEtapas: number;
}

export interface ProyectoEtapaVersionDetalleDto {
  idVersionDetalle: number;
  idVersion: number;
  idEtapa?: string | null;
  nombre: string;
  orden: number;
  esBase: boolean;
  fechaInicioPlaneada?: string | null;
  fechaFinPlaneada?: string | null;
  horasPlaneadas?: number | null;
}
