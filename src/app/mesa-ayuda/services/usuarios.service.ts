import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AreaDto,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateUsuarioRequest,
  OperationResultResponse,
  RegisterResponse,
  RolDto,
  UpdateUsuarioRequest,
  UsuarioDetailDto,
  UsuarioListItemDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = environment.apiAuth;

  constructor(private http: HttpClient) { }

  listarUsuarios(): Observable<UsuarioListItemDto[]> {
    return this.http.get<UsuarioListItemDto[]>(`${this.apiUrl}/users`);
  }

  obtenerUsuario(id: number): Observable<UsuarioDetailDto> {
    return this.http.get<UsuarioDetailDto>(`${this.apiUrl}/users/${id}`);
  }

  crearUsuario(request: CreateUsuarioRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  actualizarUsuario(id: number, request: UpdateUsuarioRequest): Observable<OperationResultResponse> {
    return this.http.put<OperationResultResponse>(`${this.apiUrl}/users/${id}`, request);
  }

  activarUsuario(id: number): Observable<OperationResultResponse> {
    return this.http.post<OperationResultResponse>(`${this.apiUrl}/users/${id}/activate`, {});
  }

  desactivarUsuario(id: number): Observable<OperationResultResponse> {
    return this.http.post<OperationResultResponse>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  desbloquearUsuario(id: number): Observable<OperationResultResponse> {
    return this.http.post<OperationResultResponse>(`${this.apiUrl}/users/${id}/unlock`, {});
  }

  cambiarPassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${this.apiUrl}/change-password`, request);
  }

  obtenerRoles(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(`${this.apiUrl}/roles`);
  }

  obtenerAreas(): Observable<AreaDto[]> {
    return this.http.get<AreaDto[]>(`${this.apiUrl}/areas`);
  }
}
