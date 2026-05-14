import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import {
  TicketDashboardDto,
  TicketDetalleDto,
  LineaTrabajoDto,
  AgregarLineaDto,
  CrearTicketDto,
  EditTicketDto,
  TicketDashboardPaginatedDto,
  DashboardFilters,
  ActualizarLineaDto,
  CrearLineasMultiplesDto,
  CerrarTicketDto,
  EstadoTicketLineaDto
} from '../models';


@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiTicketera}/tickets`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerDashboard(idResolutor?: string, tipoTicket?: 'NORMAL' | 'PROYECTO'): Observable<TicketDashboardDto[]> {
    let params = new HttpParams();

    if (idResolutor) {
      params = params.set('idResolutor', idResolutor);
    }
    if (tipoTicket) {
      params = params.set('tipoTicket', tipoTicket);
    }

    return this.http.get<TicketDashboardDto[]>(`${this.apiUrl}/dashboard`, { params });
  }

  obtenerDashboardPaginado(filters: DashboardFilters): Observable<TicketDashboardPaginatedDto> {
    let params = new HttpParams();

    // Parámetros de paginación
    params = params.set('page', filters.page.toString());
    params = params.set('pageSize', filters.pageSize.toString());

    // Parámetros de ordenamiento
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    // Filtros opcionales
    if (filters.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters.prioridad) {
      params = params.set('prioridad', filters.prioridad);
    }
    if (filters.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    if (filters.usuarioResponsable) {
      params = params.set('usuarioResponsable', filters.usuarioResponsable);
    }
    if (filters.fechaDesde) {
      params = params.set('fechaDesde', filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      params = params.set('fechaHasta', filters.fechaHasta);
    }
    if (filters.busqueda) {
      params = params.set('busqueda', filters.busqueda);
    }
    if (filters.idResolutor) {
      params = params.set('idResolutor', filters.idResolutor);
    }
    if (filters.tipoTicket) {
      params = params.set('tipoTicket', filters.tipoTicket);
    }

    return this.http.get<TicketDashboardPaginatedDto>(`${this.apiUrl}/dashboard/paginated`, { params });
  }

  obtenerDetalleTicket(id: number): Observable<TicketDetalleDto> {
    return this.http.get<TicketDetalleDto>(`${this.apiUrl}/${id}/detalle`);
  }

  crearTicket(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  agregarLinea(ticketId: number, linea: AgregarLineaDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/lineas`, linea);
  }

  agregarLineaConArchivos(ticketId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/lineas`, formData);
  }

  finalizarTicket(ticketId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ticketId}/finalizar`, {});
  }

  /**
   * Finaliza un ticket usando las nuevas condiciones de validación
   * Endpoint: POST /api/tickets/{id}/finalize-new
   * Condiciones:
   * - Usuario con rol Consultor o Admin
   * - Ticket no finalizado
   * - Todas las líneas en estado FINALIZADO (ID_ESTADO_LINEA = 6)
   * - Al menos una línea de trabajo
   */
  finalizarTicketNuevo(ticketId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/finalize-new`, {});
  }

  // Método para actualización desde email (administradores)
  actualizarDesdeEmail(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-email`, {});
  }

  // Método para categorizar ticket (administradores)
  categorizarTicket(ticketId: number, categorizacion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ticketId}/categorizar`, categorizacion);
  }

  // Método para asignar consultor (administradores)
  asignarConsultor(ticketId: number, consultorId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ticketId}/asignar`, { consultorId });
  }

  // Método para editar ticket
  editarTicket(ticketId: number, editTicketDto: EditTicketDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ticketId}/editar`, editTicketDto);
  }

  // NUEVOS MÉTODOS: Para manejo de líneas independientes

  /**
   * Actualiza una línea específica de un ticket
   * Endpoint: PUT /api/tickets/lines/{lineId}
   */
  actualizarLinea(actualizarLineaDto: ActualizarLineaDto): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/lines/${actualizarLineaDto.idTicketLinea}`,
      actualizarLineaDto
    );
  }

  /**
   * Crea múltiples líneas simultáneamente para un ticket
   * Endpoint: POST /api/tickets/{id}/lines/multiple
   */
  crearLineasMultiples(crearLineasDto: CrearLineasMultiplesDto): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${crearLineasDto.idTicket}/lines/multiple`,
      crearLineasDto
    );
  }

  /**
   * Cierra un ticket validando que todas las líneas estén finalizadas
   * Endpoint: PUT /api/tickets/{id}/close
   */
  cerrarTicket(cerrarTicketDto: CerrarTicketDto): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${cerrarTicketDto.idTicket}/close`,
      cerrarTicketDto
    );
  }

  /**
   * Elimina un ticket. Solo administradores. No permitido para tickets de canal Correo
   * ni para tickets que tengan lineas, adjuntos, logs o etapas.
   * Endpoint: DELETE /api/tickets/{id}
   */
  eliminarTicket(ticketId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${ticketId}`);
  }

  /**
   * Reabre un ticket cerrado. Solo administradores.
   * Endpoint: PUT /api/tickets/{id}/reopen
   */
  reabrirTicket(ticketId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ticketId}/reopen`, {});
  }

  /**
   * Finaliza una línea estableciendo su tiempo real
   * Esto automáticamente cambia el estado de la línea a FINALIZADO
   */
  finalizarLineaConTiempoReal(idTicketLinea: number, tiempoReal: number, resolucion?: string): Observable<any> {
    const actualizarDto: ActualizarLineaDto = {
      idTicketLinea,
      tiempoReal,
      resolucion
      // No se especifica idEstadoLinea porque se auto-finaliza con tiempoReal
    };
    return this.actualizarLinea(actualizarDto);
  }

  /**
   * Obtiene los estados disponibles para líneas de trabajo
   * Endpoint: GET /api/Tickets/line-states
   */
  obtenerEstadosTicketLinea(): Observable<EstadoTicketLineaDto[]> {
    return this.http.get<EstadoTicketLineaDto[]>(`${this.apiUrl}/line-states`);
  }
}