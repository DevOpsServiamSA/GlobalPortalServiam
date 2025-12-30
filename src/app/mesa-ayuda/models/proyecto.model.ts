// DTOs según la API del backend
export interface ProyectoDto {
  idProyecto: string;
  nombreProyecto: string;
  descripcion: string | null;
  estado: 'A' | 'I';
  fechaInicio: string | null; // ISO 8601 format
  fechaFin: string | null; // ISO 8601 format
  idEmpresa: number | null;
  nombreEmpresa?: string | null; // Solo lectura, viene del join con empresa
}

export interface CreateProyectoRequest {
  idProyecto: string; // Código del proyecto (se convierte a mayúsculas automáticamente)
  nombreProyecto: string;
  descripcion?: string;
  fechaInicio?: string; // ISO 8601 format (YYYY-MM-DD)
  fechaFin?: string; // ISO 8601 format (YYYY-MM-DD)
  idEmpresa?: number;
}

export interface UpdateProyectoRequest {
  idProyecto: string; // Debe coincidir con el ID de la URL
  nombreProyecto: string;
  descripcion?: string;
  estado: 'A' | 'I';
  fechaInicio?: string; // ISO 8601 format (YYYY-MM-DD)
  fechaFin?: string; // ISO 8601 format (YYYY-MM-DD)
  idEmpresa?: number;
}

export interface DeleteProyectoResponse {
  message: string;
  success: boolean;
}

// Interfaz auxiliar para el formulario
export interface ProyectoFormData {
  idProyecto: string;
  nombreProyecto: string;
  descripcion: string;
  estado: 'A' | 'I';
  fechaInicio: Date | null;
  fechaFin: Date | null;
  idEmpresa: number | null;
}
