import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SlaDto } from '../models/sla.model';

@Injectable({
    providedIn: 'root'
})
export class SlaService {

    private apiUrl = `${environment.apiTicketera}/SLA`;

    constructor(private http: HttpClient) { }

    obtenerSLAs(): Observable<SlaDto[]> {
        return this.http.get<SlaDto[]>(`${this.apiUrl}`);
    }
}
