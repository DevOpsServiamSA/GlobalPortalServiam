export interface Categoria {
  idCategoria: number;
  nombre: string;
  tipo: string;
  idCategoriaPadre: number;
  nivel: number;
  padreId?: number;
  activo: boolean;
}