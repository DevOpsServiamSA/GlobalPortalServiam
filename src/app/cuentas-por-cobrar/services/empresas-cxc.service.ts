import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmpresaCxC } from '../interfaces/cxc.interfaces';
import { EmpresaMapperService } from './empresa-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresasCxcService {

  constructor(private empresaMapper: EmpresaMapperService) { }

  /**
   * Get all active companies
   */
  getEmpresas(): Observable<EmpresaCxC[]> {
    const empresasDto = this.empresaMapper.getEmpresasDto();
    const empresasCxC = empresasDto.map(dto => this.empresaMapper.toEmpresaCxC(dto));
    return of(empresasCxC);
  }

  /**
   * Get a specific company by ID
   */
  getEmpresaById(id: number): Observable<EmpresaCxC | undefined> {
    const empresas = this.empresaMapper.getEmpresasDto();
    const empresa = empresas.find(e => this.empresaMapper.toIdEmpresa(e.codigo) === id);
    return of(empresa ? this.empresaMapper.toEmpresaCxC(empresa) : undefined);
  }
}
