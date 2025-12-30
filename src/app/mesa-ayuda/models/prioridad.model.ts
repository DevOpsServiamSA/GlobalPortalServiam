// DTOs según la API del backend
export interface PrioridadDto {
  idPrioridad: number;
  nivelPrioridad: number;
  descripcion: string;
  tiempoMaxResolucion: number;
  idSLA: number;
}

export interface PrioridadDetalleDto extends PrioridadDto {
  sla: {
    idSLA: number;
    tiempoRespuesta: number;
    tiempoResolucion: number;
    nivelCriticidad: string;
  };
}

export interface CreatePrioridadRequest {
  nivelPrioridad: number;
  descripcion: string;
  tiempoMaxResolucion: number;
  idSLA: number;
}

export interface UpdatePrioridadRequest {
  idPrioridad: number;
  nivelPrioridad: number;
  descripcion: string;
  tiempoMaxResolucion: number;
  idSLA: number;
}

export interface DeletePrioridadResponse {
  message: string;
  success: boolean;
}

// Interfaz auxiliar para conversión de tiempo
export interface TiempoConvertido {
  minutos: number;
  horas: number;
  dias: number;
}

// Interfaz para niveles de prioridad con metadata visual
export interface NivelPrioridadInfo {
  nivel: number;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  criticidad: string;
}
