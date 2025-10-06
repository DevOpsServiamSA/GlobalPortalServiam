export interface EstadoTicketLinea {
  idEstadoLinea: number;
  nombreEstado: string;
  descripcion?: string;
  activo: boolean;
}

export enum EstadoTicketLineaIds {
  INICIADO = 1,
  EN_ATENCION = 2,
  DETENIDO = 3,
  EN_ESPERA = 4,
  EN_PRUEBAS = 5,
  FINALIZADO = 6
}

// Helper para obtener el nombre del estado por ID
export class EstadoTicketLineaHelper {
  private static estadosMap = new Map<number, string>([
    [EstadoTicketLineaIds.INICIADO, 'Iniciado'],
    [EstadoTicketLineaIds.EN_ATENCION, 'En Atención'],
    [EstadoTicketLineaIds.DETENIDO, 'Detenido'],
    [EstadoTicketLineaIds.EN_ESPERA, 'En Espera'],
    [EstadoTicketLineaIds.EN_PRUEBAS, 'En Pruebas'],
    [EstadoTicketLineaIds.FINALIZADO, 'Finalizado']
  ]);

  static obtenerNombrePorId(id: number): string {
    return this.estadosMap.get(id) || 'Desconocido';
  }

  static esFinalizado(id: number): boolean {
    return id === EstadoTicketLineaIds.FINALIZADO;
  }

  static esEstadoValido(id: number): boolean {
    return id >= EstadoTicketLineaIds.INICIADO && id <= EstadoTicketLineaIds.FINALIZADO;
  }
}