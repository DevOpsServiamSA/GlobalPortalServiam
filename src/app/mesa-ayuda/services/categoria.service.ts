import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CategoriaDto,
  CategoriaDetalleDto,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
  DeleteCategoriaResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiTicketera}/categorias`;

  constructor(private http: HttpClient) {}

  // Métodos existentes (compatibilidad)
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  obtenerCategoriasPorNivel(nivel: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/nivel/${nivel}`);
  }

  obtenerCategoriasHijas(padreId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/padre/${padreId}`);
  }

  // Nuevos métodos según la API documentada

  /**
   * Listar todas las categorías
   */
  getCategorias(): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>(this.apiUrl);
  }

  /**
   * Obtener categoría por ID con subcategorías
   */
  getCategoriaById(id: number): Observable<CategoriaDetalleDto> {
    return this.http.get<CategoriaDetalleDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Listar categorías por nivel (P, T, S)
   */
  getCategoriasporNivel(nivel: 'P' | 'T' | 'S'): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>(`${this.apiUrl}/nivel/${nivel}`);
  }

  /**
   * Listar subcategorías (hijas) de una categoría padre
   */
  getSubcategorias(idPadre: number): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>(`${this.apiUrl}/padre/${idPadre}`);
  }

  /**
   * Crear nueva categoría (requiere autenticación como Administrador)
   */
  createCategoria(request: CreateCategoriaRequest): Observable<CategoriaDto> {
    return this.http.post<CategoriaDto>(this.apiUrl, request);
  }

  /**
   * Actualizar categoría existente (requiere autenticación como Administrador)
   */
  updateCategoria(id: number, request: UpdateCategoriaRequest): Observable<CategoriaDto> {
    return this.http.put<CategoriaDto>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Eliminar categoría (requiere autenticación como Administrador)
   * @param id ID de la categoría a eliminar
   * @param forceDelete Si es true, elimina la categoría y todas sus subcategorías
   */
  deleteCategoria(id: number, forceDelete: boolean = false): Observable<DeleteCategoriaResponse> {
    const params = forceDelete ? '?forceDelete=true' : '';
    return this.http.delete<DeleteCategoriaResponse>(`${this.apiUrl}/${id}${params}`);
  }
}