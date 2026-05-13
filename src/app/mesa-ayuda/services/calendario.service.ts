import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeriadoDto } from '../models/feriado.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private apiUrl = `${environment.apiTicketera}/calendario`;
  private cache = new Map<string, Observable<FeriadoDto[]>>();

  constructor(private http: HttpClient) {}

  obtenerFeriados(anio?: number): Observable<FeriadoDto[]> {
    const key = anio ? `anio=${anio}` : 'all';
    if (!this.cache.has(key)) {
      const params: Record<string, string | number> = anio ? { anio } : {};
      const obs$ = this.http
        .get<FeriadoDto[]>(`${this.apiUrl}/feriados`, { params })
        .pipe(shareReplay(1));
      this.cache.set(key, obs$);
    }
    return this.cache.get(key)!;
  }

  invalidarCache(): void {
    this.cache.clear();
  }
}
