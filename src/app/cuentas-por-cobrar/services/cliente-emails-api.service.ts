import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClienteEmailDto,
  CrearEmailRequestDto,
  ActualizarEmailRequestDto,
  CodigoEmpresa
} from '../interfaces/cxc-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClienteEmailsApiService {
  private readonly baseUrl = environment.apiCuentasPorCobrar;

  constructor(private http: HttpClient) { }

  /**
   * Listar emails de un cliente
   */
  getEmailsCliente(
    empresa: CodigoEmpresa,
    codigoCliente: string
  ): Observable<{ codigoCliente: string; razonSocial: string; emails: ClienteEmailDto[] }> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.get<any>(
      `${this.baseUrl}/cliente-emails/${codigoCliente}`,
      { params }
    );
  }

  /**
   * Crear email para cliente
   */
  crearEmail(
    empresa: CodigoEmpresa,
    request: CrearEmailRequestDto
  ): Observable<any> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.post(
      `${this.baseUrl}/cliente-emails`,
      request,
      { params }
    );
  }

  /**
   * Actualizar email
   */
  actualizarEmail(
    empresa: CodigoEmpresa,
    id: number,
    request: ActualizarEmailRequestDto
  ): Observable<any> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.put(
      `${this.baseUrl}/cliente-emails/${id}`,
      request,
      { params }
    );
  }

  /**
   * Eliminar email (soft delete)
   */
  eliminarEmail(empresa: CodigoEmpresa, id: number): Observable<any> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.delete(
      `${this.baseUrl}/cliente-emails/${id}`,
      { params }
    );
  }

  /**
   * Establecer email como principal
   */
  establecerEmailPrincipal(empresa: CodigoEmpresa, id: number): Observable<any> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.patch(
      `${this.baseUrl}/cliente-emails/${id}/establecer-principal`,
      {},
      { params }
    );
  }
}
