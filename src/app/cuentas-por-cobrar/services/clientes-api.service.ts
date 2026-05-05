import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClienteDto,
  ClientesFiltrosDto,
  PaginatedResponseDto,
  CodigoEmpresa
} from '../interfaces/cxc-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientesApiService {
  private readonly baseUrl = environment.apiCuentasPorCobrar;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de clientes con filtros y paginación
   */
  getClientes(filtros: ClientesFiltrosDto): Observable<PaginatedResponseDto<ClienteDto>> {
    let params = new HttpParams()
      .set('empresa', filtros.empresa)
      .set('fechaCorte', filtros.fechaCorte);

    // Filtros opcionales
    if (filtros.ruc) params = params.set('ruc', filtros.ruc);
    if (filtros.codigo) params = params.set('codigo', filtros.codigo);
    if (filtros.razonSocial) params = params.set('razonSocial', filtros.razonSocial);
    if (filtros.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    if (filtros.soloConSaldo !== undefined) params = params.set('soloConSaldo', filtros.soloConSaldo.toString());
    if (filtros.moneda) params = params.set('moneda', filtros.moneda);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.pageSize) params = params.set('pageSize', filtros.pageSize.toString());
    if (filtros.orderBy) params = params.set('orderBy', filtros.orderBy);
    if (filtros.orderDir) params = params.set('orderDir', filtros.orderDir);

    return this.http.get<PaginatedResponseDto<ClienteDto>>(
      `${this.baseUrl}/clientes`,
      { params }
    );
  }
}
