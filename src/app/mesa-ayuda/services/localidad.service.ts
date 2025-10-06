import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LocalidadDto } from "../models/localidad.model";


@Injectable({
  providedIn: 'root'
})
export class LocalidadService {
  private apiUrl = `${environment.apiTicketera}/localidades`

  constructor(private http: HttpClient) { }

  obtenerLocalidades(): Observable<LocalidadDto[]> {
    return this.http.get<LocalidadDto[]>(`${this.apiUrl}`);
  }
}