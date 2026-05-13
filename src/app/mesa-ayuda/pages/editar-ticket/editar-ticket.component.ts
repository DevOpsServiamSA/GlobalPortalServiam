import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriaService } from '../../services/categoria.service';
import { EstadoTicketService } from '../../services/estadoTicket.service';
import { EmpresaService } from '../../services/empresa.service';
import { PrioridadService } from '../../services/prioridad.service';
import { LocalidadService } from '../../services/localidad.service';
import { EmpleadoService } from '../../services/empleado.service';
import {
  TicketDetalleDto,
  EditTicketDto,
  Categoria,
  nivelAtencionDto,
  EstadoTicketDto,
  Empresa,
  PrioridadDto,
  LocalidadDto,
  SlaDto,
  EmpleadoDto,
  ResolutorDto,
  ProyectoPorEmpresaDto
} from '../../models';

@Component({
  selector: 'app-editar-ticket',
  templateUrl: './editar-ticket.component.html',
  styleUrls: ['./editar-ticket.component.css'],
  standalone: false
})
export class EditarTicketComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ticketId: number = 0;
  ticket: TicketDetalleDto | null = null;
  editForm: FormGroup;
  loading = true;
  saving = false;
  error = false;
  errorMessage = '';
  
  // Control de permisos
  isAdmin = false;
  accessDenied = false;

  // Datos para dropdowns
  empresas: Empresa[] = [];
  categorias1: Categoria[] = [];
  categorias2: Categoria[] = [];
  categorias3: Categoria[] = [];
  estadosTicket: EstadoTicketDto[] = [];
  prioridades: PrioridadDto[] = [];
  localidades: LocalidadDto[] = [];
  empleados: EmpleadoDto[] = [];
  resolutores: ResolutorDto[] = [];
  proyectos: ProyectoPorEmpresaDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ticketService: TicketService,
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private estadoTicketService: EstadoTicketService,
    private empresaService: EmpresaService,
    private prioridadService: PrioridadService,
    private localidadService: LocalidadService,
    private empleadoService: EmpleadoService
  ) {
    this.editForm = this.fb.group({
      idUsuarioResponsable: [''],
      idUsuarioAfectado: [''],
      idResolutorActual: [''],
      idEmpresa: [''],
      idCanal: [''],
      idCategoria1: [''],
      idCategoria2: [''],
      idCategoria3: [''],
      idProyecto: [''],
      idPrioridad: [''],
      idLocalidad: [''],
      detalleEvento: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    // Verificar permisos de administrador
    this.isAdmin = this.authService.hasRole('administrador');
    
    if (!this.isAdmin) {
      this.accessDenied = true;
      this.loading = false;
      return;
    }

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.ticketId = +params['id'];
      if (this.ticketId) {
        this.cargarDatosIniciales();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatosIniciales(): void {
    // Cargar todos los datos necesarios en paralelo
    const cargas = [
      this.cargarTicket(),
      this.cargarEmpresas(),
      this.cargarCategorias(),
      this.cargarEstadosTicket(),
      this.cargarPrioridades(),
      this.cargarLocalidades(),
      this.cargarEmpleados(),
      this.cargarResolutores()
    ];

    Promise.allSettled(cargas).then(() => {
      this.loading = false;
    });
  }

  private cargarTicket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ticketService.obtenerDetalleTicket(this.ticketId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ticket) => {
            this.ticket = ticket;
            this.inicializarFormulario();
            this.cargarProyectos(ticket.idEmpresa);
            resolve();
          },
          error: (err: any) => {
            this.error = true;
            this.errorMessage = 'Error al cargar el ticket';
            console.error('Error al cargar ticket:', err);
            reject(err);
          }
        });
    });
  }

  private cargarEmpresas(): Promise<void> {
    return new Promise((resolve) => {
      this.empresaService.obtenerEmpresas()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (empresas) => {
            this.empresas = empresas;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar empresas:', err);
            resolve();
          }
        });
    });
  }

  private cargarCategorias(): Promise<void> {
    return new Promise((resolve) => {
      this.categoriaService.obtenerCategoriasPorNivel('P')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categorias) => {
            this.categorias1 = categorias;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar categorías:', err);
            resolve();
          }
        });
    });
  }

  private cargarEstadosTicket(): Promise<void> {
    return new Promise((resolve) => {
      this.estadoTicketService.obtenerEstadosTicket()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (estados) => {
            this.estadosTicket = estados.filter(e => !['F', 'X', 'C'].includes(e.idEstadoTicket));
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar estados:', err);
            resolve();
          }
        });
    });
  }

  private cargarPrioridades(): Promise<void> {
    return new Promise((resolve) => {
      this.prioridadService.obtenerTipoDePrioridades()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (prioridades: PrioridadDto[]) => {
            this.prioridades = prioridades;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar prioridades:', err);
            resolve();
          }
        });
    });
  }

  private cargarLocalidades(): Promise<void> {
    return new Promise((resolve) => {
      this.localidadService.obtenerLocalidades()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (localidades) => {
            this.localidades = localidades;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar localidades:', err);
            resolve();
          }
        });
    });
  }

  private inicializarFormulario(): void {
    if (!this.ticket) return;

    // Precargar categorías hijas si existen
    if (this.ticket.idCategoria1) {
      this.cargarCategoriasHijas(this.ticket.idCategoria1, 2);
    }
    if (this.ticket.idCategoria2) {
      this.cargarCategoriasHijas(this.ticket.idCategoria2, 3);
    }

    // Inicializar formulario con valores actuales del ticket
    this.editForm.patchValue({
      idUsuarioResponsable: this.ticket.idUsuarioResponsable,
      idUsuarioAfectado: this.ticket.idUsuarioAfectado,
      idResolutorActual: this.ticket.idResolutorActual,
      idEmpresa: this.ticket.idEmpresa,
      idCategoria1: this.ticket.idCategoria1,
      idCategoria2: this.ticket.idCategoria2,
      idCategoria3: this.ticket.idCategoria3,
      idProyecto: this.ticket.idProyecto,
      idPrioridad: this.ticket.nivelPrioridad,
      idLocalidad: this.ticket.idLocalidad,
      detalleEvento: this.ticket.detalleEvento,
      estado: this.ticket.idEstadoTicket
    });

    // Inmutabilidad: si el ticket ya tiene proyecto asignado, deshabilitar el control
    if (this.ticket.idProyecto) {
      this.editForm.get('idProyecto')?.disable({ emitEvent: false });
    } else {
      this.editForm.get('idProyecto')?.enable({ emitEvent: false });
    }
  }

  get proyectoBloqueado(): boolean {
    return !!this.ticket?.idProyecto;
  }

  onCategoria1Change(): void {
    const categoria1Id = this.editForm.get('idCategoria1')?.value;
    if (categoria1Id) {
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria1Id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categorias) => {
            this.categorias2 = categorias;
            this.editForm.patchValue({ idCategoria2: '', idCategoria3: '' });
            this.categorias3 = [];
          },
          error: (err: any) => {
            console.error('Error al cargar categorías nivel 2:', err);
          }
        });
    } else {
      this.categorias2 = [];
      this.categorias3 = [];
      this.editForm.patchValue({ idCategoria2: '', idCategoria3: '' });
    }
  }

  onCategoria2Change(): void {
    const categoria2Id = this.editForm.get('idCategoria2')?.value;
    if (categoria2Id) {
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria2Id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categorias) => {
            this.categorias3 = categorias;
            this.editForm.patchValue({ idCategoria3: '' });
          },
          error: (err: any) => {
            console.error('Error al cargar categorías nivel 3:', err);
          }
        });
    } else {
      this.categorias3 = [];
      this.editForm.patchValue({ idCategoria3: '' });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid && this.ticket) {
      this.saving = true;
      this.error = false;

      // Crear DTO solo con los campos que tienen valor
      const editDto: EditTicketDto = {
        idTicket: this.ticketId
      };

      // Solo incluir campos que tienen valor.
      // editForm.value excluye automáticamente los controles deshabilitados,
      // por lo que idProyecto no se enviará cuando el proyecto está bloqueado.
      const formValue = this.editForm.value;
      Object.keys(formValue).forEach(key => {
        if (formValue[key] && formValue[key] !== '') {
          (editDto as any)[key] = formValue[key];
        }
      });

      this.ticketService.editarTicket(this.ticketId, editDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.saving = false;
            this.router.navigate(['/mesa-ayuda']);
          },
          error: (err: any) => {
            this.saving = false;
            this.error = true;
            
            // Manejo específico para error 403
            if (err.status === 403) {
              this.errorMessage = 'No tienes permisos para editar este ticket. Solo los administradores pueden editar tickets.';
            } else {
              this.errorMessage = err.error?.message || 'Error al actualizar el ticket';
            }
            
            console.error('Error al actualizar ticket:', err);
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/mesa-ayuda']);
  }

  // Métodos auxiliares para verificar permisos
  puedeEditar(): boolean {
    return this.ticket?.estado !== 'FINALIZADO' && 
           this.ticket?.estado !== 'CANCELADO' && 
           this.ticket?.estado !== 'CERRADO';
  }

  private cargarEmpleados(): Promise<void> {
    return new Promise((resolve) => {
      this.empleadoService.obtenerEmpleados()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (empleados) => {
            this.empleados = empleados;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar empleados:', err);
            resolve();
          }
        });
    });
  }

  private cargarResolutores(): Promise<void> {
    return new Promise((resolve) => {
      this.empleadoService.obtenerResolutores()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resolutores) => {
            this.resolutores = resolutores;
            resolve();
          },
          error: (err: any) => {
            console.error('Error al cargar resolutores:', err);
            resolve();
          }
        });
    });
  }

  private cargarProyectos(empresaId: number): void {
    this.empresaService.obtenerProyectosPorEmpresa(empresaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proyectos) => {
          this.proyectos = proyectos;
        },
        error: (err: any) => {
          console.error('Error al cargar proyectos:', err);
          this.proyectos = [];
        }
      });
  }

  onEmpresaChange(): void {
    const empresaId = this.editForm.get('idEmpresa')?.value;
    if (empresaId) {
      this.cargarProyectos(parseInt(empresaId));
      // No limpiar idProyecto si está bloqueado por inmutabilidad
      if (!this.proyectoBloqueado) {
        this.editForm.patchValue({ idProyecto: '' });
      }
    } else {
      this.proyectos = [];
      if (!this.proyectoBloqueado) {
        this.editForm.patchValue({ idProyecto: '' });
      }
    }
  }

  private cargarCategoriasHijas(padreId: number, nivel: number): void {
    this.categoriaService.obtenerCategoriasHijas(padreId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorias) => {
          if (nivel === 2) {
            this.categorias2 = categorias;
          } else if (nivel === 3) {
            this.categorias3 = categorias;
          }
        },
        error: (err: any) => {
          console.error(`Error al cargar categorías nivel ${nivel}:`, err);
        }
      });
  }
}