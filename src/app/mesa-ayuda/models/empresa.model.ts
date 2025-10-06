export interface Empresa {
  idEmpresa: number;
  nombre: string;
  razonSocial: string;
  activo: boolean;
}

export interface ProyectoPorEmpresaDto {
  idProyecto: string;
  nombreProyecto: string;
  descripcion: string;
}