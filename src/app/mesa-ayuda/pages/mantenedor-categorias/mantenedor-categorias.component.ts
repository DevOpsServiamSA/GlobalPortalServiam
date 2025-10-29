import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import {
  CategoriaDto,
  CategoriaTreeNode,
  CreateCategoriaRequest,
  UpdateCategoriaRequest
} from '../../models';
import { Observable, map, startWith } from 'rxjs';

interface TipoCategoria {
  value: 'P' | 'T' | 'S';
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-mantenedor-categorias',
  templateUrl: './mantenedor-categorias.component.html',
  styleUrls: ['./mantenedor-categorias.component.css'],
  standalone: false
})
export class MantenedorCategoriasComponent implements OnInit {
  // Estado general
  loading = false;
  categorias: CategoriaDto[] = [];
  categoriasTree: CategoriaTreeNode[] = [];

  // Panel lateral
  showPanel = false;
  isEditMode = false;
  categoriaForm!: FormGroup;

  // Categoría seleccionada
  selectedCategoria: CategoriaDto | null = null;

  // Tipos de categoría
  tipos: TipoCategoria[] = [
    {
      value: 'P',
      label: 'Principal',
      icon: 'folder',
      description: 'Categoría raíz sin padre'
    },
    {
      value: 'T',
      label: 'Tipo',
      icon: 'category',
      description: 'Subcategoría de una Principal'
    },
    {
      value: 'S',
      label: 'Sub',
      icon: 'label',
      description: 'Subcategoría de un Tipo'
    }
  ];

  // Categorías disponibles como padre
  categoriasDisponiblesPadre: CategoriaDto[] = [];

  // Para selección en cascada de tipo SUB
  categoriasPrincipales: CategoriaDto[] = [];
  categoriasTipoFiltradas: CategoriaDto[] = [];

  // Autocompletado de nombres
  nombresSugeridos: string[] = [];
  filteredNombres!: Observable<string[]>;

  // Mensajes y notificaciones
  successMessage = '';
  errorMessage = '';

  // Vista expandida/colapsada
  expandAll = false;

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategorias();
    this.setupAutocomplete();
  }

  initForm(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['P', Validators.required],
      idCategoriaPrincipal: [null], // Solo para UI cuando tipo es 'S'
      idCategoriaPadre: [null]
    });

    // Observar cambios en el tipo para ajustar validaciones
    this.categoriaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.onTipoChange(tipo);
    });

    // Observar cambios en la categoría principal para filtrar tipos
    this.categoriaForm.get('idCategoriaPrincipal')?.valueChanges.subscribe(idPrincipal => {
      this.onPrincipalChange(idPrincipal);
    });
  }

  setupAutocomplete(): void {
    const nombreControl = this.categoriaForm.get('nombre');
    if (nombreControl) {
      this.filteredNombres = nombreControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterNombres(value || ''))
      );
    }
  }

  private _filterNombres(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nombresSugeridos.filter(nombre =>
      nombre.toLowerCase().includes(filterValue)
    );
  }

  loadCategorias(): void {
    this.loading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.buildTree();
        this.updateNombresSugeridos();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.showError('Error al cargar las categorías');
        this.loading = false;
      }
    });
  }

  buildTree(): void {
    // Construir árbol jerárquico
    const principales = this.categorias.filter(c => c.tipo === 'P');

    this.categoriasTree = principales.map(principal => {
      const tipos = this.categorias.filter(c => c.tipo === 'T' && c.idCategoriaPadre === principal.idCategoria);

      return {
        ...principal,
        expanded: this.expandAll,
        level: 0,
        subcategorias: tipos.map(tipo => ({
          ...tipo,
          expanded: this.expandAll,
          level: 1,
          subcategorias: this.categorias
            .filter(c => c.tipo === 'S' && c.idCategoriaPadre === tipo.idCategoria)
            .map(sub => ({
              ...sub,
              expanded: false,
              level: 2
            }))
        }))
      };
    });
  }

  updateNombresSugeridos(): void {
    // Obtener todos los nombres únicos para autocompletado
    this.nombresSugeridos = [...new Set(this.categorias.map(c => c.nombre))];
  }

  onTipoChange(tipo: 'P' | 'T' | 'S'): void {
    const padreControl = this.categoriaForm.get('idCategoriaPadre');
    const principalControl = this.categoriaForm.get('idCategoriaPrincipal');

    if (tipo === 'P') {
      // Principal no requiere padre
      padreControl?.setValue(null);
      padreControl?.clearValidators();
      principalControl?.setValue(null);
      principalControl?.clearValidators();
      this.categoriasDisponiblesPadre = [];
      this.categoriasPrincipales = [];
      this.categoriasTipoFiltradas = [];
    } else if (tipo === 'T') {
      // Tipo requiere una categoría Principal como padre
      padreControl?.setValidators([Validators.required]);
      principalControl?.setValue(null);
      principalControl?.clearValidators();
      this.categoriasDisponiblesPadre = this.categorias.filter(c => c.tipo === 'P');
      this.categoriasPrincipales = [];
      this.categoriasTipoFiltradas = [];
    } else if (tipo === 'S') {
      // Sub requiere selección en cascada: Principal → Tipo
      principalControl?.setValidators([Validators.required]);
      padreControl?.setValidators([Validators.required]);
      principalControl?.setValue(null);
      padreControl?.setValue(null);

      // Cargar las categorías principales disponibles
      this.categoriasPrincipales = this.categorias.filter(c => c.tipo === 'P');
      this.categoriasTipoFiltradas = []; // Se llenará cuando se seleccione una principal
      this.categoriasDisponiblesPadre = []; // No se usa en el nuevo flujo
    }

    principalControl?.updateValueAndValidity();
    padreControl?.updateValueAndValidity();
  }

  onPrincipalChange(idPrincipal: number | null): void {
    const padreControl = this.categoriaForm.get('idCategoriaPadre');

    if (idPrincipal) {
      // Convertir a number ya que los valores de <select> son strings
      const idPrincipalNum = Number(idPrincipal);

      // Filtrar las categorías Tipo que son hijas de la Principal seleccionada
      this.categoriasTipoFiltradas = this.categorias.filter(
        c => c.tipo === 'T' && c.idCategoriaPadre === idPrincipalNum
      );
    } else {
      // Si no hay principal seleccionada, limpiar el filtro
      this.categoriasTipoFiltradas = [];
    }

    // Limpiar la selección de Tipo cuando cambia la Principal
    padreControl?.setValue(null);
  }

  openCreatePanel(): void {
    this.isEditMode = false;
    this.selectedCategoria = null;
    this.categoriaForm.reset({ tipo: 'P', idCategoriaPrincipal: null, idCategoriaPadre: null });
    this.showPanel = true;
  }

  openEditPanel(categoria: CategoriaTreeNode): void {
    this.isEditMode = true;
    this.selectedCategoria = categoria;

    // Si es tipo SUB, necesitamos encontrar su categoría Principal (abuelo)
    let idPrincipal: number | null = null;
    if (categoria.tipo === 'S' && categoria.idCategoriaPadre) {
      const categoriaTipo = this.categorias.find(c => c.idCategoria === categoria.idCategoriaPadre);
      if (categoriaTipo) {
        idPrincipal = categoriaTipo.idCategoriaPadre;
      }
    }

    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      idCategoriaPrincipal: idPrincipal,
      idCategoriaPadre: categoria.idCategoriaPadre
    });

    // Si es tipo S, cargar las categorías Tipo filtradas por la Principal
    if (categoria.tipo === 'S' && idPrincipal) {
      this.categoriasTipoFiltradas = this.categorias.filter(
        c => c.tipo === 'T' && c.idCategoriaPadre === idPrincipal
      );
    }

    this.showPanel = true;
  }

  closePanel(): void {
    this.showPanel = false;
    this.categoriaForm.reset({ tipo: 'P', idCategoriaPrincipal: null, idCategoriaPadre: null });
    this.selectedCategoria = null;
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.updateCategoria();
    } else {
      this.createCategoria();
    }
  }

  createCategoria(): void {
    const request: CreateCategoriaRequest = {
      nombre: this.categoriaForm.value.nombre.trim(),
      tipo: this.categoriaForm.value.tipo,
      idCategoriaPadre: this.categoriaForm.value.idCategoriaPadre
    };

    this.loading = true;
    this.categoriaService.createCategoria(request).subscribe({
      next: (response) => {
        this.showSuccess('Categoría creada exitosamente');
        this.loadCategorias();
        this.closePanel();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        const message = error.error?.message || 'Error al crear la categoría';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  updateCategoria(): void {
    if (!this.selectedCategoria) return;

    const request: UpdateCategoriaRequest = {
      idCategoria: this.selectedCategoria.idCategoria,
      nombre: this.categoriaForm.value.nombre.trim(),
      tipo: this.categoriaForm.value.tipo,
      idCategoriaPadre: this.categoriaForm.value.idCategoriaPadre
    };

    this.loading = true;
    this.categoriaService.updateCategoria(this.selectedCategoria.idCategoria, request).subscribe({
      next: (response) => {
        this.showSuccess('Categoría actualizada exitosamente');
        this.loadCategorias();
        this.closePanel();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar categoría:', error);
        const message = error.error?.message || 'Error al actualizar la categoría';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  deleteCategoria(categoria: CategoriaTreeNode): void {
    const hasSubcategorias = categoria.subcategorias && categoria.subcategorias.length > 0;

    let confirmMessage = `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`;

    if (hasSubcategorias) {
      confirmMessage = `La categoría "${categoria.nombre}" tiene ${categoria.subcategorias!.length} subcategoría(s).\n\n` +
        `¿Desea eliminarla junto con todas sus subcategorías?\n\n` +
        `Haga clic en OK para eliminar todo, o Cancelar para abortar.`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading = true;
    this.categoriaService.deleteCategoria(categoria.idCategoria, hasSubcategorias).subscribe({
      next: (response) => {
        this.showSuccess(response.message || 'Categoría eliminada exitosamente');
        this.loadCategorias();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        const message = error.error?.message || 'Error al eliminar la categoría';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  toggleExpand(categoria: CategoriaTreeNode): void {
    categoria.expanded = !categoria.expanded;
  }

  toggleExpandAll(): void {
    this.expandAll = !this.expandAll;
    this.applyExpandAll(this.categoriasTree, this.expandAll);
  }

  private applyExpandAll(nodes: CategoriaTreeNode[], expand: boolean): void {
    nodes.forEach(node => {
      node.expanded = expand;
      if (node.subcategorias) {
        this.applyExpandAll(node.subcategorias, expand);
      }
    });
  }

  getTipoInfo(tipo: 'P' | 'T' | 'S'): TipoCategoria {
    return this.tipos.find(t => t.value === tipo) || this.tipos[0];
  }

  getNombrePadre(idPadre: number | null): string {
    if (!idPadre) return 'Sin padre';
    const padre = this.categorias.find(c => c.idCategoria === idPadre);
    return padre ? padre.nombre : 'Desconocido';
  }

  getNombrePrincipal(idPrincipal: number | null): string {
    if (!idPrincipal) return '';
    const principal = this.categorias.find(c => c.idCategoria === idPrincipal);
    return principal ? principal.nombre : '';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 8000);
  }

  // Utilidad para obtener el color según el tipo
  getTipoColor(tipo: 'P' | 'T' | 'S'): string {
    switch (tipo) {
      case 'P': return 'text-serviam-primary dark:text-serviam-dark-primary';
      case 'T': return 'text-serviam-secondary dark:text-serviam-dark-secondary';
      case 'S': return 'text-serviam-alert dark:text-serviam-dark-alert';
      default: return 'text-gray-600';
    }
  }

  getTipoBgColor(tipo: 'P' | 'T' | 'S'): string {
    switch (tipo) {
      case 'P': return 'bg-serviam-primary/10 dark:bg-serviam-dark-primary/10';
      case 'T': return 'bg-serviam-secondary/10 dark:bg-serviam-dark-secondary/10';
      case 'S': return 'bg-serviam-alert/10 dark:bg-serviam-dark-alert/10';
      default: return 'bg-gray-100';
    }
  }
}
