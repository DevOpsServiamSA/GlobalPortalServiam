import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EmpresaCxC } from '../interfaces/cxc.interfaces';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresasCxcService {

  constructor(private mockDataService: MockDataService) { }

  /**
   * Get all active companies
   * Simulates API call with delay
   */
  getEmpresas(): Observable<EmpresaCxC[]> {
    return of(this.mockDataService.getEmpresas()).pipe(
      delay(300) // Simulate network delay
    );
  }

  /**
   * Get a specific company by ID
   * Simulates API call with delay
   */
  getEmpresaById(id: number): Observable<EmpresaCxC | undefined> {
    return of(this.mockDataService.getEmpresaById(id)).pipe(
      delay(200)
    );
  }

  // Future: Replace with actual HTTP calls
  // getEmpresas(): Observable<EmpresaCxC[]> {
  //   return this.http.get<EmpresaCxC[]>(`${environment.apiCuentasPorCobrar}/empresas`);
  // }
  //
  // getEmpresaById(id: number): Observable<EmpresaCxC> {
  //   return this.http.get<EmpresaCxC>(`${environment.apiCuentasPorCobrar}/empresas/${id}`);
  // }
}
