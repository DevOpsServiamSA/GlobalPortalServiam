import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    PrioridadDto,
    PrioridadDetalleDto,
    CreatePrioridadRequest,
    UpdatePrioridadRequest,
    DeletePrioridadResponse
} from '../models';

@Injectable({
    providedIn: 'root'
})
export class PrioridadService {

    private apiUrl = `${environment.apiTicketera}/prioridades`;

    constructor(private http: HttpClient) { }

    // Método existente (mantener compatibilidad)
    obtenerTipoDePrioridades(): Observable<PrioridadDto[]> {
        return this.http.get<PrioridadDto[]>(`${this.apiUrl}`);
    }

    // Nuevos métodos según la API documentada

    /**
     * Listar todas las prioridades activas
     */
    getPrioridades(): Observable<PrioridadDto[]> {
        return this.http.get<PrioridadDto[]>(this.apiUrl);
    }

    /**
     * Obtener prioridad por ID con información del SLA
     */
    getPrioridadById(id: number): Observable<PrioridadDetalleDto> {
        return this.http.get<PrioridadDetalleDto>(`${this.apiUrl}/${id}`);
    }

    /**
     * Crear nueva prioridad (requiere autenticación como Administrador)
     */
    createPrioridad(request: CreatePrioridadRequest): Observable<PrioridadDto> {
        return this.http.post<PrioridadDto>(this.apiUrl, request);
    }

    /**
     * Actualizar prioridad existente (requiere autenticación como Administrador)
     */
    updatePrioridad(id: number, request: UpdatePrioridadRequest): Observable<PrioridadDto> {
        return this.http.put<PrioridadDto>(`${this.apiUrl}/${id}`, request);
    }

    /**
     * Eliminar prioridad - Soft Delete (requiere autenticación como Administrador)
     * Marca la prioridad como inactiva en lugar de eliminarla físicamente
     */
    deletePrioridad(id: number): Observable<DeletePrioridadResponse> {
        return this.http.delete<DeletePrioridadResponse>(`${this.apiUrl}/${id}`);
    }
}
