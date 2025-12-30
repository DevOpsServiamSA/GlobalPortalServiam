import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrioridadService } from '../../services/prioridad.service';
import { SlaService } from '../../services/sla.service';
import {
  PrioridadDto,
  CreatePrioridadRequest,
  UpdatePrioridadRequest,
  NivelPrioridadInfo,
  TiempoConvertido
} from '../../models';
import { SlaDto } from '../../models/sla.model';

@Component({
  selector: 'app-mantenedor-prioridades',
  templateUrl: './mantenedor-prioridades.component.html',
  styleUrls: ['./mantenedor-prioridades.component.css'],
  standalone: false
})
export class MantenedorPrioridadesComponent implements OnInit {
  // Estado general
  loading = false;
  prioridades: PrioridadDto[] = [];
  slas: SlaDto[] = [];

  // Panel lateral
  showPanel = false;
  isEditMode = false;
  prioridadForm!: FormGroup;

  // Prioridad seleccionada
  selectedPrioridad: PrioridadDto | null = null;

  // Configuración de niveles de prioridad con metadata visual
  nivelesInfo: NivelPrioridadInfo[] = [
    {
      nivel: 1,
      label: 'Crítico',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'priority_high',
      criticidad: 'Crítico'
    },
    {
      nivel: 2,
      label: 'Alto',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      icon: 'warning',
      criticidad: 'Alto'
    },
    {
      nivel: 3,
      label: 'Medio',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'info',
      criticidad: 'Medio'
    },
    {
      nivel: 4,
      label: 'Bajo',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: 'check_circle',
      criticidad: 'Bajo'
    }
  ];

  // Unidades de tiempo
  unidadesTiempo = [
    { value: 'minutos', label: 'Minutos' },
    { value: 'horas', label: 'Horas' },
    { value: 'dias', label: 'Días' }
  ];

  // Control de tiempo
  tiempoValor: number = 0;
  tiempoUnidad: string = 'horas';
  tiempoConvertido: TiempoConvertido = { minutos: 0, horas: 0, dias: 0 };

  // Mensajes y notificaciones
  successMessage = '';
  errorMessage = '';

  constructor(
    private prioridadService: PrioridadService,
    private slaService: SlaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPrioridades();
    this.loadSLAs();
  }

  initForm(): void {
    this.prioridadForm = this.fb.group({
      nivelPrioridad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      tiempoMaxResolucion: [0, [Validators.required, Validators.min(1)]],
      idSLA: [null, Validators.required]
    });
  }

  loadPrioridades(): void {
    this.loading = true;
    this.prioridadService.getPrioridades().subscribe({
      next: (data) => {
        this.prioridades = data.sort((a, b) => a.nivelPrioridad - b.nivelPrioridad);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar prioridades:', error);
        this.showError('Error al cargar las prioridades');
        this.loading = false;
      }
    });
  }

  loadSLAs(): void {
    this.slaService.obtenerSLAs().subscribe({
      next: (data) => {
        this.slas = data;
      },
      error: (error) => {
        console.error('Error al cargar SLAs:', error);
        this.showError('Error al cargar los SLAs');
      }
    });
  }

  openCreatePanel(): void {
    this.isEditMode = false;
    this.selectedPrioridad = null;
    this.tiempoValor = 4;
    this.tiempoUnidad = 'horas';
    this.prioridadForm.reset({ nivelPrioridad: 1, tiempoMaxResolucion: 240, idSLA: null });
    this.calcularTiempoConvertido();
    this.showPanel = true;
  }

  openEditPanel(prioridad: PrioridadDto): void {
    this.isEditMode = true;
    this.selectedPrioridad = prioridad;

    // Calcular la mejor unidad para mostrar el tiempo
    const tiempoInfo = this.obtenerMejorUnidadTiempo(prioridad.tiempoMaxResolucion);
    this.tiempoValor = tiempoInfo.valor;
    this.tiempoUnidad = tiempoInfo.unidad;

    this.prioridadForm.patchValue({
      nivelPrioridad: prioridad.nivelPrioridad,
      descripcion: prioridad.descripcion,
      tiempoMaxResolucion: prioridad.tiempoMaxResolucion,
      idSLA: prioridad.idSLA
    });

    this.calcularTiempoConvertido();
    this.showPanel = true;
  }

  closePanel(): void {
    this.showPanel = false;
    this.prioridadForm.reset({ nivelPrioridad: 1, tiempoMaxResolucion: 0, idSLA: null });
    this.selectedPrioridad = null;
    this.tiempoValor = 0;
    this.tiempoUnidad = 'horas';
  }

  onSubmit(): void {
    if (this.prioridadForm.invalid) {
      this.prioridadForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.updatePrioridad();
    } else {
      this.createPrioridad();
    }
  }

  createPrioridad(): void {
    const request: CreatePrioridadRequest = {
      nivelPrioridad: this.prioridadForm.value.nivelPrioridad,
      descripcion: this.prioridadForm.value.descripcion.trim(),
      tiempoMaxResolucion: this.prioridadForm.value.tiempoMaxResolucion,
      idSLA: this.prioridadForm.value.idSLA
    };

    this.loading = true;
    this.prioridadService.createPrioridad(request).subscribe({
      next: (response) => {
        this.showSuccess('Prioridad creada exitosamente');
        this.loadPrioridades();
        this.closePanel();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear prioridad:', error);
        const message = error.error?.message || 'Error al crear la prioridad';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  updatePrioridad(): void {
    if (!this.selectedPrioridad) return;

    const request: UpdatePrioridadRequest = {
      idPrioridad: this.selectedPrioridad.idPrioridad,
      nivelPrioridad: this.prioridadForm.value.nivelPrioridad,
      descripcion: this.prioridadForm.value.descripcion.trim(),
      tiempoMaxResolucion: this.prioridadForm.value.tiempoMaxResolucion,
      idSLA: this.prioridadForm.value.idSLA
    };

    this.loading = true;
    this.prioridadService.updatePrioridad(this.selectedPrioridad.idPrioridad, request).subscribe({
      next: (response) => {
        this.showSuccess('Prioridad actualizada exitosamente');
        this.loadPrioridades();
        this.closePanel();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar prioridad:', error);
        const message = error.error?.message || 'Error al actualizar la prioridad';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  deletePrioridad(prioridad: PrioridadDto): void {
    const confirmMessage =
      `¿Está seguro de eliminar la prioridad de nivel ${prioridad.nivelPrioridad}?\n\n` +
      `"${prioridad.descripcion}"\n\n` +
      `Nota: Esta es una eliminación lógica (soft delete). La prioridad se marcará como inactiva.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading = true;
    this.prioridadService.deletePrioridad(prioridad.idPrioridad).subscribe({
      next: (response) => {
        this.showSuccess(response.message || 'Prioridad eliminada exitosamente');
        this.loadPrioridades();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar prioridad:', error);
        const message = error.error?.message || 'Error al eliminar la prioridad';
        this.showError(message);
        this.loading = false;
      }
    });
  }

  // Métodos de conversión de tiempo

  onTiempoChange(): void {
    let minutos = 0;

    switch (this.tiempoUnidad) {
      case 'minutos':
        minutos = this.tiempoValor;
        break;
      case 'horas':
        minutos = this.tiempoValor * 60;
        break;
      case 'dias':
        minutos = this.tiempoValor * 24 * 60;
        break;
    }

    this.prioridadForm.patchValue({ tiempoMaxResolucion: minutos });
    this.calcularTiempoConvertido();
  }

  calcularTiempoConvertido(): void {
    const minutos = this.prioridadForm.value.tiempoMaxResolucion || 0;
    this.tiempoConvertido = {
      minutos: minutos,
      horas: Math.round((minutos / 60) * 100) / 100,
      dias: Math.round((minutos / (24 * 60)) * 100) / 100
    };
  }

  obtenerMejorUnidadTiempo(minutos: number): { valor: number; unidad: string } {
    if (minutos < 60) {
      return { valor: minutos, unidad: 'minutos' };
    } else if (minutos < 1440) { // menos de 24 horas
      return { valor: Math.round((minutos / 60) * 100) / 100, unidad: 'horas' };
    } else {
      return { valor: Math.round((minutos / 1440) * 100) / 100, unidad: 'dias' };
    }
  }

  formatTiempo(minutos: number): string {
    const info = this.obtenerMejorUnidadTiempo(minutos);
    return `${info.valor} ${info.unidad}`;
  }

  // Métodos auxiliares

  getNivelInfo(nivel: number): NivelPrioridadInfo {
    return this.nivelesInfo.find(n => n.nivel === nivel) || this.nivelesInfo[3];
  }

  getSlaInfo(idSLA: number): SlaDto | undefined {
    return this.slas.find(s => s.idSLA === idSLA);
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
}
