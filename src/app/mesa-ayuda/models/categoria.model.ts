// DTOs según la API del backend
export interface CategoriaDto {
  idCategoria: number;
  nombre: string;
  tipo: 'P' | 'T' | 'S';
  idCategoriaPadre: number | null;
}

export interface CategoriaDetalleDto extends CategoriaDto {
  subcategorias: CategoriaDto[];
}

export interface CreateCategoriaRequest {
  nombre: string;
  tipo: 'P' | 'T' | 'S';
  idCategoriaPadre: number | null;
}

export interface UpdateCategoriaRequest {
  idCategoria: number;
  nombre: string;
  tipo: 'P' | 'T' | 'S';
  idCategoriaPadre: number | null;
}

export interface DeleteCategoriaResponse {
  message: string;
  success: boolean;
}

// Interfaz extendida para la vista de árbol
export interface CategoriaTreeNode extends CategoriaDto {
  subcategorias?: CategoriaTreeNode[];
  expanded?: boolean;
  level?: number;
}

// Mantener interfaz original para compatibilidad con código existente
export interface Categoria {
  idCategoria: number;
  nombre: string;
  tipo: string;
  idCategoriaPadre: number;
  nivel: number;
  padreId?: number;
  activo: boolean;
}