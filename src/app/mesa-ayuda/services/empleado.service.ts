import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EmpleadoDto, ResolutorDto } from "../models";

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
}