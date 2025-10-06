import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoTicketDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EstadoTicketService {
  private readonly API_URL = `${environment.apiTicketera}/EstadosTicket`;

  constructor(private http: HttpClient) { }

  obtenerEstadosTicket(): Observable<EstadoTicketDto[]> {
    return this.http.get<EstadoTicketDto[]>(this.API_URL);
  }
}