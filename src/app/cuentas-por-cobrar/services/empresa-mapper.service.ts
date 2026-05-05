import { Injectable } from '@angular/core';
import { CodigoEmpresa, EmpresaDto } from '../interfaces/cxc-api.interfaces';
import { EmpresaCxC } from '../interfaces/cxc.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmpresaMapperService {

  // Mapeo hardcoded entre IDs legacy y códigos API
  private readonly EMPRESA_MAP: { [key: number]: CodigoEmpresa } = {
    1: 'POLYSOL',
    2: 'TMI',
    3: 'SERVIAM',
    4: 'FILASUR',
    5: 'NK',
    6: 'FATIMA'
  };

  // Reverso del mapeo
  private readonly CODIGO_TO_ID_MAP: { [key in CodigoEmpresa]: number } = {
    'POLYSOL': 1,
    'TMI': 2,
    'SERVIAM': 3,
    'FILASUR': 4,
    'NK': 5,
    'FATIMA': 6
  };

  // Nombres completos
  private readonly EMPRESA_NOMBRES: { [key in CodigoEmpresa]: string } = {
    'POLYSOL': 'Polysol S.A.C.',
    'TMI': 'TM Inmobiliaria S.A.C.',
    'SERVIAM': 'Serviam S.A.C.',
    'FILASUR': 'Filasur S.A.C.',
    'NK': 'NK S.A.C.',
    'FATIMA': 'Fátima S.A.C.'
  };

  /**
   * Convierte ID numérico a código de empresa
   */
  toCodigoEmpresa(id: number): CodigoEmpresa {
    const codigo = this.EMPRESA_MAP[id];
    if (!codigo) {
      throw new Error(`ID de empresa inválido: ${id}`);
    }
    return codigo;
  }

  /**
   * Convierte código de empresa a ID numérico
   */
  toIdEmpresa(codigo: CodigoEmpresa): number {
    const id = this.CODIGO_TO_ID_MAP[codigo];
    if (!id) {
      throw new Error(`Código de empresa inválido: ${codigo}`);
    }
    return id;
  }

  /**
   * Obtiene nombre completo de empresa por código
   */
  getNombreEmpresa(codigo: CodigoEmpresa): string {
    return this.EMPRESA_NOMBRES[codigo];
  }

  /**
   * Convierte EmpresaDto (API) a EmpresaCxC (UI legacy)
   */
  toEmpresaCxC(dto: EmpresaDto): EmpresaCxC {
    return {
      id: this.toIdEmpresa(dto.codigo),
      razonSocial: dto.nombre,
      ruc: '', // No disponible en DTO, usar vacío
      activo: dto.activo
    };
  }

  /**
   * Obtiene todas las empresas disponibles como DTOs
   */
  getEmpresasDto(): EmpresaDto[] {
    return [
      { codigo: 'FILASUR', nombre: 'Filasur S.A.C.', activo: true },
      { codigo: 'NK', nombre: 'NK S.A.C.', activo: true },
      { codigo: 'POLYSOL', nombre: 'Polysol S.A.C.', activo: true },
      { codigo: 'SERVIAM', nombre: 'Serviam S.A.C.', activo: true },
      { codigo: 'TMI', nombre: 'TM Inmobiliaria S.A.C.', activo: true },
      { codigo: 'FATIMA', nombre: 'Fátima S.A.C.', activo: true }
    ];
  }
}
