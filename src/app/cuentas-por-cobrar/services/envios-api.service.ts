import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EnviarEstadosCuentaRequestDto,
  EnvioIniciadoResponseDto,
  HistorialEnvioDto,
  HistorialFiltrosDto,
  PaginatedResponseDto,
  CodigoEmpresa
} from '../interfaces/cxc-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EnviosApiService {
  private readonly baseUrl = environment.apiCuentasPorCobrar;

  constructor(private http: HttpClient) { }

  /**
   * Enviar estados de cuenta por email
   */
  enviarEstadosCuenta(
    empresa: CodigoEmpresa,
    request: EnviarEstadosCuentaRequestDto
  ): Observable<EnvioIniciadoResponseDto> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.post<EnvioIniciadoResponseDto>(
      `${this.baseUrl}/envios/enviar-estados-cuenta`,
      request,
      { params }
    );
  }

  /**
   * Obtener historial de envíos
   */
  getHistorialEnvios(
    filtros: HistorialFiltrosDto
  ): Observable<PaginatedResponseDto<HistorialEnvioDto>> {
    let params = new HttpParams().set('empresa', filtros.empresa);

    // Filtros opcionales
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.usuario) params = params.set('usuario', filtros.usuario);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.searchTerm) params = params.set('searchTerm', filtros.searchTerm);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.pageSize) params = params.set('pageSize', filtros.pageSize.toString());
    if (filtros.orderBy) params = params.set('orderBy', filtros.orderBy);
    if (filtros.orderDir) params = params.set('orderDir', filtros.orderDir);

    return this.http.get<PaginatedResponseDto<HistorialEnvioDto>>(
      `${this.baseUrl}/envios/historial`,
      { params }
    );
  }
}
