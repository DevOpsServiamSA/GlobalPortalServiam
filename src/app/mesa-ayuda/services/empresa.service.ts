import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, ProyectoPorEmpresaDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = `${environment.apiTicketera}/empresas`;

  constructor(private http: HttpClient) {}

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  obtenerEmpresaPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  obtenerProyectosPorEmpresa(empresaId: number): Observable<ProyectoPorEmpresaDto[]> {
    return this.http.get<ProyectoPorEmpresaDto[]>(`${this.apiUrl}/${empresaId}/proyectos`);
  }
}