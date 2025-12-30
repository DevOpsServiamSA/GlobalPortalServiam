import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProyectoDto,
  CreateProyectoRequest,
  UpdateProyectoRequest,
  DeleteProyectoResponse
} from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = `${environment.apiTicketera}/proyectos`;

  constructor(private http: HttpClient) {}

  /**
   * Listar proyectos con filtros opcionales
   * @param empresaId Filtrar por empresa (opcional)
   * @param estado Filtrar por estado: 'A' (Activo) o 'I' (Inactivo) (opcional)
   */
  getProyectos(empresaId?: number, estado?: 'A' | 'I'): Observable<ProyectoDto[]> {
    let params = new HttpParams();

    if (empresaId !== undefined && empresaId !== null) {
      params = params.set('empresaId', empresaId.toString());
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ProyectoDto[]>(this.apiUrl, { params });
  }

  /**
   * Obtener un proyecto específico por su código
   * @param id Código del proyecto (string)
   */
  getProyectoById(id: string): Observable<ProyectoDto> {
    return this.http.get<ProyectoDto>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Crear nuevo proyecto (requiere autenticación como Administrador)
   */
  createProyecto(request: CreateProyectoRequest): Observable<ProyectoDto> {
    return this.http.post<ProyectoDto>(this.apiUrl, request);
  }

  /**
   * Actualizar proyecto existente (requiere autenticación como Administrador)
   * @param id Código del proyecto a actualizar
   */
  updateProyecto(id: string, request: UpdateProyectoRequest): Observable<ProyectoDto> {
    return this.http.put<ProyectoDto>(`${this.apiUrl}/${encodeURIComponent(id)}`, request);
  }

  /**
   * Eliminar proyecto físicamente (requiere autenticación como Administrador)
   * No se puede eliminar si está siendo utilizado por tickets
   * @param id Código del proyecto a eliminar
   */
  deleteProyecto(id: string): Observable<DeleteProyectoResponse> {
    return this.http.delete<DeleteProyectoResponse>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
