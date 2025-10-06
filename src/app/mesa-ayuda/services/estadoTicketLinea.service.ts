import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoTicketLinea, EstadoTicketLineaIds } from '../models/estadoTicketLinea.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoTicketLineaService {
  private apiUrl = `${environment.apiTicketera}/estados-linea`;

  // TODO: TEMPORAL - Data dummy que simula la respuesta del backend
  // Este array será reemplazado por la llamada HTTP real cuando el endpoint esté listo
  private estadosDummy: EstadoTicketLinea[] = [
    {
      idEstadoLinea: EstadoTicketLineaIds.INICIADO,
      nombreEstado: 'Iniciado',
      descripcion: 'Línea recién creada, pendiente de iniciar trabajo',
      activo: true
    },
    {
      idEstadoLinea: EstadoTicketLineaIds.EN_ATENCION,
      nombreEstado: 'En Atención',
      descripcion: 'Línea en proceso de resolución activa',
      activo: true
    },
    {
      idEstadoLinea: EstadoTicketLineaIds.DETENIDO,
      nombreEstado: 'Detenido',
      descripcion: 'Línea pausada temporalmente por el resolutor',
      activo: true
    },
    {
      idEstadoLinea: EstadoTicketLineaIds.EN_ESPERA,
      nombreEstado: 'En Espera',
      descripcion: 'Esperando información adicional del usuario o terceros',
      activo: true
    },
    {
      idEstadoLinea: EstadoTicketLineaIds.EN_PRUEBAS,
      nombreEstado: 'En Pruebas',
      descripcion: 'Solución implementada, en fase de pruebas y validación',
      activo: true
    },
    {
      idEstadoLinea: EstadoTicketLineaIds.FINALIZADO,
      nombreEstado: 'Finalizado',
      descripcion: 'Línea de trabajo completada exitosamente',
      activo: true
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * TODO: MÉTODO TEMPORAL - Obtiene los estados de línea usando data dummy
   *
   * Cuando el endpoint del backend esté listo, reemplazar este método con:
   *
   * obtenerEstados(): Observable<EstadoTicketLinea[]> {
   *   return this.http.get<EstadoTicketLinea[]>(`${this.apiUrl}`);
   * }
   *
   * El endpoint esperado debe retornar un array con la estructura:
   * {
   *   "idEstadoLinea": number,
   *   "nombreEstado": string,
   *   "descripcion": string,
   *   "activo": boolean
   * }
   */
  obtenerEstados(): Observable<EstadoTicketLinea[]> {
    // Simular delay de API para hacer más realista
    return of(this.estadosDummy).pipe(delay(300));
  }

  /**
   * Obtiene un estado específico por su ID
   * @param id ID del estado a buscar
   * @returns Observable con el estado encontrado o undefined
   */
  obtenerEstadoPorId(id: number): Observable<EstadoTicketLinea | undefined> {
    const estado = this.estadosDummy.find(e => e.idEstadoLinea === id);
    return of(estado).pipe(delay(100));
  }

  /**
   * Obtiene solo los estados activos para uso en formularios
   * @returns Observable con array de estados activos
   */
  obtenerEstadosActivos(): Observable<EstadoTicketLinea[]> {
    const estadosActivos = this.estadosDummy.filter(e => e.activo);
    return of(estadosActivos).pipe(delay(200));
  }

  /**
   * Valida si un estado permite la transición a finalizado
   * @param idEstadoOrigen ID del estado origen
   * @returns true si puede finalizar, false si no
   */
  puedeFinalizarDesde(idEstadoOrigen: number): boolean {
    return idEstadoOrigen !== EstadoTicketLineaIds.FINALIZADO;
  }
}