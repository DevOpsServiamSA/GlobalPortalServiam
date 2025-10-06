import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiTicketera}/categorias`;

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  obtenerCategoriasPorNivel(nivel: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/nivel/${nivel}`);
  }

  obtenerCategoriasHijas(padreId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/padre/${padreId}`);
  }
}