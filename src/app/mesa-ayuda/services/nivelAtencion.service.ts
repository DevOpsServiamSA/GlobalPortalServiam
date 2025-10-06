import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { nivelAtencionDto } from '../models/nivelAtencion.model';

@Injectable({
    providedIn: 'root'
})
export class NivelAtencionService {

    private apiUrl = `${environment.apiTicketera}/nivelesAtencion`;

    constructor(private http: HttpClient) { }

    obtenerNivelesAtencion(): Observable<nivelAtencionDto[]> {
        return this.http.get<nivelAtencionDto[]>(`${this.apiUrl}`);
    }
}
