export interface RolDto {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
}

export interface AreaDto {
  idArea: number;
  nombreArea: string;
  idAreaErp?: string;
}

export interface UsuarioListItemDto {
  idUsuario: number;
  usuarioLogin: string;
  email: string;
  codigoEmpleado?: string;
  idArea?: string;
  nombreArea?: string;
  estado: boolean;
  intentosFallidos: number;
  bloqueado: boolean;
  ultimoIngreso?: string;
  fechaCreacion: string;
  roles: string[];
}

export interface UsuarioDetailDto {
  idUsuario: number;
  usuarioLogin: string;
  email: string;
  codigoEmpleado?: string;
  idArea?: string;
  nombreArea?: string;
  estado: boolean;
  intentosFallidos: number;
  bloqueado: boolean;
  requiereReset: boolean;
  ultimoIngreso?: string;
  passwordLastChanged: string;
  usuarioCreacion: string;
  fechaCreacion: string;
  roles: RolDto[];
}

export interface CreateUsuarioRequest {
  usuarioLogin: string;
  email: string;
  password: string;
  codigoEmpleado?: string;
  idArea?: string;
  roleIds: number[];
}

export interface UpdateUsuarioRequest {
  email: string;
  codigoEmpleado?: string;
  idArea?: string;
  estado: boolean;
  requiereReset: boolean;
  roleIds: number[];
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    idUsuario: number;
    usuarioLogin: string;
    email: string;
    codigoEmpleado?: string;
    roles: string[];
  };
}

export interface OperationResultResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  targetUserId?: number;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
