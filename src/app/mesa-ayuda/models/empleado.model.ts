export interface EmpleadoDto {
  idEmpleado: string;
  nombre: string;
  rucEmpresa: string;
  idDepartamento: string;
}

export interface ResolutorDto {
  idEmpleado: string;
  nombre: string;
  departamento: string;
  puesto: string;
}

export interface EmailStatusDto {
  codigoEmpleado: string;
  email: string | null;
  tieneCorreo: boolean;
}
