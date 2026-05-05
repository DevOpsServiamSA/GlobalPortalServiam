import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EmpleadoDto, ResolutorDto, EmailStatusDto } from "../models";

@Injectable({
    providedIn: 'root'
})
export class EmpleadoService{
    private apiUrl = `${environment.apiTicketera}/empleados`

    constructor(private http: HttpClient){}

    obtenerEmpleados(): Observable<EmpleadoDto[]>{
        return this.http.get<EmpleadoDto[]>(`${this.apiUrl}`)
    }

    obtenerResolutores(): Observable<ResolutorDto[]>{
        return this.http.get<ResolutorDto[]>(`${this.apiUrl}/serviam`)
    }

    /**
     * Valida si un empleado tiene correo configurado
     * GET /api/empleados/{codigoEmpleado}/email-status
     */
    validarEmailEmpleado(codigoEmpleado: string): Observable<EmailStatusDto> {
        return this.http.get<EmailStatusDto>(
            `${this.apiUrl}/${codigoEmpleado}/email-status`
        );
    }

    /**
     * Actualiza el correo de un empleado
     * PUT /api/empleados/{codigoEmpleado}/email
     */
    actualizarEmailEmpleado(codigoEmpleado: string, email: string): Observable<any> {
        return this.http.put(
            `${this.apiUrl}/${codigoEmpleado}/email`,
            { email }
        );
    }
}