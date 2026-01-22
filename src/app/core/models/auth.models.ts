export interface LoginRequest {
  usuarioLogin: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  idUsuario: number;
  usuarioLogin: string;
  email: string;
  codigoEmpleado?: string;
  roles: string[];
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    codigoEmpleado: string;
    idArea: string;
    roles: string[];
  };
}