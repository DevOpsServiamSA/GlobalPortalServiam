import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProyectoService } from '../../services/proyecto.service';
import { EmpresaService } from '../../services/empresa.service';
import { NotificationService } from '../../services/notification.service';
import { ProyectoDto, CreateProyectoRequest, UpdateProyectoRequest } from '../../models/proyecto.model';
import { Empresa } from '../../models';

@Component({
  selector: 'app-mantenedor-proyectos',
  templateUrl: './mantenedor-proyectos.component.html',
  styleUrls: ['./mantenedor-proyectos.component.css'],
  standalone: false
})
export class MantenedorProyectosComponent implements OnInit {
  proyectos: ProyectoDto[] = [];
  proyectosFiltrados: ProyectoDto[] = [];
  empresas: Empresa[] = [];

  proyectoForm!: FormGroup;

  isPanelOpen = false;
  isEditMode = false;
  proyectoSeleccionado: ProyectoDto | null = null;

  // Filtros
  filtroEmpresa: number | null = null;
  filtroEstado: 'A' | 'I' | null = null;
  filtroBusqueda = '';

  cargando = false;
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private empresaService: EmpresaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEmpresas();
    this.cargarProyectos();
  }

  inicializarFormulario(): void {
    this.proyectoForm = this.fb.group({
      idProyecto: ['', [Validators.required, Validators.maxLength(50)]],
      nombreProyecto: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: [''],
      estado: ['A', Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      idEmpresa: [null]
    }, { validators: this.validadorFechas });
  }

  /**
   * Validador personalizado para asegurar que fechaFin >= fechaInicio
   */
  validadorFechas(group: FormGroup): { [key: string]: any } | null {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (fin < inicio) {
        return { fechaFinInvalida: true };
      }
    }

    return null;
  }

  cargarEmpresas(): void {
    this.empresaService.obtenerEmpresas().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
        this.mensajeError = 'Error al cargar las empresas';
      }
    });
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.proyectoService.getProyectos(
      this.filtroEmpresa ?? undefined,
      this.filtroEstado ?? undefined
    ).subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.mensajeError = 'Error al cargar los proyectos';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.proyectos];

    // Filtro por texto de búsqueda
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.idProyecto.toLowerCase().includes(busqueda) ||
        p.nombreProyecto.toLowerCase().includes(busqueda) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda)) ||
        (p.nombreEmpresa && p.nombreEmpresa.toLowerCase().includes(busqueda))
      );
    }

    this.proyectosFiltrados = resultado;
  }

  onFiltroEmpresaChange(): void {
    this.cargarProyectos();
  }

  onFiltroEstadoChange(): void {
    this.cargarProyectos();
  }

  onFiltroBusquedaChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroEmpresa = null;
    this.filtroEstado = null;
    this.filtroBusqueda = '';
    this.cargarProyectos();
  }

  abrirPanelCrear(): void {
    this.isEditMode = false;
    this.proyectoSeleccionado = null;
    this.proyectoForm.reset({
      estado: 'A'
    });
    this.proyectoForm.get('idProyecto')?.enable();
    this.isPanelOpen = true;
  }

  abrirPanelEditar(proyecto: ProyectoDto): void {
    this.isEditMode = true;
    this.proyectoSeleccionado = proyecto;

    this.proyectoForm.patchValue({
      idProyecto: proyecto.idProyecto,
      nombreProyecto: proyecto.nombreProyecto,
      descripcion: proyecto.descripcion || '',
      estado: proyecto.estado,
      fechaInicio: proyecto.fechaInicio ? this.extraerFechaISO(proyecto.fechaInicio) : null,
      fechaFin: proyecto.fechaFin ? this.extraerFechaISO(proyecto.fechaFin) : null,
      idEmpresa: proyecto.idEmpresa
    });

    // Deshabilitar el campo de código en modo edición
    this.proyectoForm.get('idProyecto')?.disable();
    this.isPanelOpen = true;
  }

  cerrarPanel(): void {
    this.isPanelOpen = false;
    this.isEditMode = false;
    this.proyectoSeleccionado = null;
    this.proyectoForm.reset();
    this.mensajeError = '';
  }

  guardarProyecto(): void {
    if (this.proyectoForm.invalid) {
      this.proyectoForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const formValue = this.proyectoForm.getRawValue();

    // Convertir fechas a formato ISO (YYYY-MM-DD) si existen
    const fechaInicioISO = formValue.fechaInicio
      ? this.convertirAFormatoISO(formValue.fechaInicio)
      : undefined;
    const fechaFinISO = formValue.fechaFin
      ? this.convertirAFormatoISO(formValue.fechaFin)
      : undefined;

    if (this.isEditMode && this.proyectoSeleccionado) {
      // Actualizar proyecto existente
      const request: UpdateProyectoRequest = {
        idProyecto: formValue.idProyecto.toUpperCase(),
        nombreProyecto: formValue.nombreProyecto.trim(),
        descripcion: formValue.descripcion?.trim() || undefined,
        estado: formValue.estado,
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO,
        idEmpresa: formValue.idEmpresa || undefined
      };

      this.proyectoService.updateProyecto(this.proyectoSeleccionado.idProyecto, request).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarPanel();
          this.cargando = false;
          this.notificationService.showSuccess('Proyecto actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar proyecto:', error);
          const mensaje = error.error?.message || 'Error al actualizar el proyecto';
          this.mensajeError = mensaje;
          this.notificationService.showError(mensaje);
          this.cargando = false;
        }
      });
    } else {
      // Crear nuevo proyecto
      const request: CreateProyectoRequest = {
        idProyecto: formValue.idProyecto.toUpperCase(),
        nombreProyecto: formValue.nombreProyecto.trim(),
        descripcion: formValue.descripcion?.trim() || undefined,
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO,
        idEmpresa: formValue.idEmpresa || undefined
      };

      this.proyectoService.createProyecto(request).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarPanel();
          this.cargando = false;
          this.notificationService.showSuccess('Proyecto creado exitosamente');
        },
        error: (error) => {
          console.error('Error al crear proyecto:', error);
          const mensaje = error.error?.message || 'Error al crear el proyecto';
          this.mensajeError = mensaje;
          this.notificationService.showError(mensaje);
          this.cargando = false;
        }
      });
    }
  }

  eliminarProyecto(proyecto: ProyectoDto): void {
    const confirmacion = confirm(
      `⚠️ ATENCIÓN: Esta operación eliminará permanentemente el proyecto "${proyecto.nombreProyecto}".\n\n` +
      `Si este proyecto tiene tickets asociados, la eliminación fallará.\n\n` +
      `¿Está seguro de que desea continuar?`
    );

    if (!confirmacion) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.proyectoService.deleteProyecto(proyecto.idProyecto).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarProyectos();
          this.notificationService.showSuccess('Proyecto eliminado exitosamente');
        } else {
          const mensaje = response.message || 'No se pudo eliminar el proyecto';
          this.mensajeError = mensaje;
          this.notificationService.showError(mensaje);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar proyecto:', error);
        let mensaje: string;
        if (error.status === 409) {
          mensaje = 'No se puede eliminar el proyecto porque tiene tickets asociados';
          this.notificationService.showWarning(mensaje);
        } else {
          mensaje = error.error?.message || 'Error al eliminar el proyecto';
          this.notificationService.showError(mensaje);
        }
        this.mensajeError = mensaje;
        this.cargando = false;
      }
    });
  }

  /**
   * Extrae solo la parte de fecha de un string ISO con tiempo
   * Ejemplo: "2024-09-16T00:00:00" -> "2024-09-16"
   */
  private extraerFechaISO(fechaISO: string): string {
    return fechaISO.split('T')[0];
  }

  /**
   * Convierte una fecha a formato ISO YYYY-MM-DD
   */
  convertirAFormatoISO(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea una fecha ISO para mostrar
   */
  formatearFecha(fechaISO: string | null): string {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL');
  }

  /**
   * Obtiene el badge de estado con estilos
   */
  obtenerEstiloEstado(estado: 'A' | 'I'): { label: string; clase: string } {
    if (estado === 'A') {
      return {
        label: 'Activo',
        clase: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      };
    } else {
      return {
        label: 'Inactivo',
        clase: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      };
    }
  }

  /**
   * Transforma el código a mayúsculas mientras el usuario escribe
   */
  onCodigoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart;
    const upperValue = input.value.toUpperCase();

    this.proyectoForm.patchValue({ idProyecto: upperValue }, { emitEvent: false });

    // Restaurar posición del cursor
    setTimeout(() => {
      input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  /**
   * Obtiene el mensaje de error del formulario
   */
  obtenerMensajeError(campo: string): string {
    const control = this.proyectoForm.get(campo);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    if (campo === 'fechaFin' && this.proyectoForm.hasError('fechaFinInvalida')) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    return '';
  }
}
