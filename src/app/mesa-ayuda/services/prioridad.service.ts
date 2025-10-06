import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrioridadDto } from '../models';

@Injectable({
    providedIn: 'root'
})
export class PrioridadService {

    private apiUrl = `${environment.apiTicketera}/prioridades`;

    constructor(private http: HttpClient) { }

    obtenerTipoDePrioridades(): Observable<PrioridadDto[]> {
        return this.http.get<PrioridadDto[]>(`${this.apiUrl}`);
    }
}
