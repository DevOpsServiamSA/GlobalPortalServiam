import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProyectoEtapaDto,
  ProyectoEtapaVersionDetalleDto,
  ProyectoEtapaVersionDto,
  UpsertEtapasProyectoRequest
} from '../models/proyectoEtapa.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoEtapaService {
  private apiUrl = `${environment.apiTicketera}/proyectos`;

  constructor(private http: HttpClient) {}

  obtenerEtapasPorProyecto(idProyecto: string): Observable<ProyectoEtapaDto[]> {
    return this.http.get<ProyectoEtapaDto[]>(
      `${this.apiUrl}/${encodeURIComponent(idProyecto)}/etapas`
    );
  }

  guardarEtapasProyecto(
    idProyecto: string,
    request: UpsertEtapasProyectoRequest
  ): Observable<ProyectoEtapaDto[]> {
    return this.http.put<ProyectoEtapaDto[]>(
      `${this.apiUrl}/${encodeURIComponent(idProyecto)}/etapas`,
      request
    );
  }

  listarVersiones(idProyecto: string): Observable<ProyectoEtapaVersionDto[]> {
    return this.http.get<ProyectoEtapaVersionDto[]>(
      `${this.apiUrl}/${encodeURIComponent(idProyecto)}/etapas/versiones`
    );
  }

  obtenerDetalleVersion(idProyecto: string, idVersion: number): Observable<ProyectoEtapaVersionDetalleDto[]> {
    return this.http.get<ProyectoEtapaVersionDetalleDto[]>(
      `${this.apiUrl}/${encodeURIComponent(idProyecto)}/etapas/versiones/${idVersion}`
    );
  }
}
