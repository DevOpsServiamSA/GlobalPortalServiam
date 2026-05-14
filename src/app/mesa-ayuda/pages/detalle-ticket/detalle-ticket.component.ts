import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { NivelAtencionService } from '../../services/nivelAtencion.service';
// import { EstadoTicketService } from '../../services/estadoTicket.service'; // Ya no se usa para líneas
import { CategoriaService } from '../../services/categoria.service';
import {
  TicketDetalleDto,
  AgregarLineaDto,
  nivelAtencionDto,
  EstadoTicketDto,
  EstadoTicketLineaDto,
  Categoria,
  ProyectoEtapaDto,
  UpsertEtapaItemRequest,
  UpsertEtapasProyectoRequest,
  ProyectoEtapaVersionDto,
  ProyectoEtapaVersionDetalleDto,
  FeriadoDto
} from '../../models';
import { StyleUtilsService, DateUtilsService } from '../../utils';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ProyectoEtapaService } from '../../services/proyectoEtapa.service';
import { CalendarioService } from '../../services/calendario.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  ConfirmDialogResult
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-detalle-ticket',
  templateUrl: './detalle-ticket.component.html',
  styleUrls: ['./detalle-ticket.component.css'],
  standalone: false
})
export class DetalleTicketComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ticket: TicketDetalleDto | null = null;
  loading = true;
  error = false;
  ticketId: number = 0;

  // Control de vista
  isMobile = false;
  showDrawer = false;
  
  // Control de permisos
  isAdmin = false;
  isConsultor = false;
  currentUser: any = null;

  // Formularios
  lineaForm: FormGroup;
  finalizarLineaForm: FormGroup;
  showLineaForm = false;

  // Modal finalizar línea
  showFinalizarModal = false;
  lineaSeleccionada: any = null;

  // Estados
  loadingAction = false;
  nivelesAtencion: nivelAtencionDto[] = [];
  estadosTicketLinea: EstadoTicketLineaDto[] = [];
  archivosSeleccionados: File[] = [];
  categorias1: Categoria[] = [];
  categorias2: Categoria[] = [];
  categorias3: Categoria[] = [];

  // Etapas del proyecto (solo aplica si ticket.idProyecto)
  etapasProyecto: ProyectoEtapaDto[] = [];
  etapasForm!: FormArray;
  editandoEtapas = false;
  loadingEtapas = false;
  guardandoEtapas = false;
  feriadosSet = new Set<string>();

  // Versiones históricas de etapas
  versionesEtapas: ProyectoEtapaVersionDto[] = [];
  loadingVersiones = false;
  mostrarVersiones = false;
  versionSeleccionada: ProyectoEtapaVersionDto | null = null;
  detalleVersion: ProyectoEtapaVersionDetalleDto[] = [];
  loadingDetalleVersion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private nivelAtencionService: NivelAtencionService,
    // private estadoTicketService: EstadoTicketService, // Ya no se usa para líneas
    private categoriaService: CategoriaService,
    private proyectoEtapaService: ProyectoEtapaService,
    private calendarioService: CalendarioService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.lineaForm = this.fb.group({
      tiempoProyectado: [0, [Validators.required, Validators.min(0.1)]],
      idNivelAtencion: ['', Validators.required],
      resolucion: [''],
      idEstadoLinea: ['', Validators.required],
      idCategoria1: [''],
      idCategoria2: [''],
      idCategoria3: [''],
      idProyectoEtapa: ['']
    });

    this.etapasForm = this.fb.array([]);

    this.finalizarLineaForm = this.fb.group({
      tiempoReal: ['', [Validators.required, Validators.min(0.1)]],
      idEstadoLinea: ['', Validators.required],
      resolucion: ['', Validators.required]
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Inicializar permisos
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.hasRole('administrador');
    this.isConsultor = this.authService.hasRole('consultor');

    this.checkScreenSize();
    this.cargarNivelesAtencion();
    this.cargarEstadosTicketLinea();
    this.cargarCategorias();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.ticketId = +params['id'];
      if (this.ticketId) {
        // Solo cargar y mostrar en móvil, en desktop redirigir de vuelta
        if (this.isMobile) {
          this.cargarDetalleTicket();
        } else {
          // En desktop, redirigir inmediatamente de vuelta al dashboard
          this.router.navigate(['/mesa-ayuda']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768; // md breakpoint de Tailwind

    // Si cambia de móvil a desktop y estamos viendo un ticket, redirigir
    if (wasMobile && !this.isMobile && this.ticketId) {
      this.router.navigate(['/mesa-ayuda']);
    }
  }

  cargarDetalleTicket(): void {
    this.loading = true;
    this.error = false;

    this.ticketService.obtenerDetalleTicket(this.ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.ticket = data;
          this.loading = false;
          this.aplicarValidadorEtapaLinea();
          if (this.ticket?.idProyecto) {
            this.cargarEtapasProyecto(this.ticket.idProyecto);
            this.cargarFeriados();
            this.cargarVersionesEtapas(this.ticket.idProyecto);
          } else {
            this.etapasProyecto = [];
            this.editandoEtapas = false;
            this.versionesEtapas = [];
          }
        },
        error: (err) => {
          console.error('Error al cargar detalle del ticket:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }

  // Navegación
  volver(): void {
    this.router.navigate(['/mesa-ayuda']);
  }

  cerrarDrawer(): void {
    this.showDrawer = false;
    // Pequeño delay para permitir animación antes de navegar
    setTimeout(() => {
      this.router.navigate(['/mesa-ayuda']);
    }, 200);
  }

  // Acciones del ticket
  mostrarFormularioLinea(): void {
    this.showLineaForm = true;
  }

  ocultarFormularioLinea(): void {
    this.showLineaForm = false;
    this.archivosSeleccionados = [];
    this.lineaForm.reset({
      tiempoProyectado: 0,
      idNivelAtencion: '',
      resolucion: '',
      idEstadoLinea: '',
      idCategoria1: '',
      idCategoria2: '',
      idCategoria3: '',
      idProyectoEtapa: ''
    });
    this.categorias2 = [];
    this.categorias3 = [];
  }

  agregarLinea(): void {
    if (this.lineaForm.valid && this.ticket && this.currentUser) {
      this.loadingAction = true;

      const formData = new FormData();
      
      // Crear objeto JSON para el campo 'linea' con nuevos campos
      const lineaData = {
        IdTicket: this.ticket.idTicket,
        IdResolutor: this.currentUser.codigoEmpleado,
        IdNivelAtencion: parseInt(this.lineaForm.value.idNivelAtencion),
        TiempoProyectado: parseFloat(this.lineaForm.value.tiempoProyectado),
        IdEstadoLinea: parseInt(this.lineaForm.value.idEstadoLinea),
        Resolucion: this.lineaForm.value.resolucion || '',
        IdCategoria1: this.lineaForm.value.idCategoria1 ? parseInt(this.lineaForm.value.idCategoria1) : null,
        IdCategoria2: this.lineaForm.value.idCategoria2 ? parseInt(this.lineaForm.value.idCategoria2) : null,
        IdCategoria3: this.lineaForm.value.idCategoria3 ? parseInt(this.lineaForm.value.idCategoria3) : null,
        IdProyectoEtapa: this.lineaForm.value.idProyectoEtapa ? parseInt(this.lineaForm.value.idProyectoEtapa) : null
      };
      
      // Agregar el JSON como string en el campo 'linea'
      formData.append('linea', JSON.stringify(lineaData));
      
      // Agregar archivos si existen
      this.archivosSeleccionados.forEach(archivo => {
        formData.append('adjuntos', archivo);
      });

      this.ticketService.agregarLineaConArchivos(this.ticket.idTicket, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadingAction = false;
            this.ocultarFormularioLinea();
            this.cargarDetalleTicket(); // Recargar para ver la nueva línea
          },
          error: (err) => {
            console.error('Error al agregar línea:', err);
            this.loadingAction = false;
            
            // Manejo específico para error 401
            if (err.status === 401) {
              alert('No tienes permisos para agregar líneas a este ticket. Solo el resolutor actual del ticket puede agregar líneas.');
            } else {
              alert('Error al agregar línea de trabajo: ' + (err.error?.message || err.message));
            }
          }
        });
    }
  }

  finalizarTicket(): void {
    if (!this.ticket) return;

    if (confirm('¿Está seguro de que desea finalizar este ticket?')) {
      this.loadingAction = true;

      this.ticketService.finalizarTicketNuevo(this.ticket.idTicket)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadingAction = false;
            this.cargarDetalleTicket(); // Recargar para ver el cambio de estado
          },
          error: (err) => {
            console.error('Error al finalizar ticket:', err);
            this.loadingAction = false;
            this.manejarErrorFinalizacion(err);
          }
        });
    }
  }

  // ============================
  // Eliminar / Cerrar / Reabrir (solo Admin)
  // ============================

  private esCanalCorreo(canal?: string): boolean {
    if (!canal) return false;
    const normalizado = canal.trim().toLowerCase();
    return normalizado === 'correo' || normalizado === 'email' || normalizado === 'e-mail';
  }

  private tieneContenido(): boolean {
    if (!this.ticket) return false;
    const tieneLineas = this.ticket.lineasTrabajo && this.ticket.lineasTrabajo.length > 0;
    const tieneAdjuntos = !!this.ticket.adjuntos;
    return tieneLineas || tieneAdjuntos;
  }

  estaCerrado(): boolean {
    if (!this.ticket) return false;
    const estado = this.ticket.estado?.toLowerCase();
    return estado === 'c' || estado === 'cerrado' || this.ticket.idEstadoTicket === 'C';
  }

  estaFinalizado(): boolean {
    if (!this.ticket) return false;
    const estado = this.ticket.estado?.toLowerCase();
    return estado === 'f'
      || estado === 'finalizado'
      || this.ticket.idEstadoTicket === 'F'
      || !!this.ticket.fechaFinalizacion;
  }

  /**
   * Solo admin puede eliminar tickets, solo si canal NO es Correo
   * y el ticket NO tiene lineas, adjuntos, logs ni etapas.
   */
  puedeEliminar(): boolean {
    if (!this.ticket || !this.isAdmin) return false;
    if (this.esCanalCorreo(this.ticket.canal)) return false;
    if (this.tieneContenido()) return false;
    if (this.estaCerrado() || this.estaFinalizado()) return false;
    return true;
  }

  /**
   * Solo admin puede cerrar tickets. Disponible si el ticket no está ya cerrado/finalizado.
   */
  puedeCerrar(): boolean {
    if (!this.ticket || !this.isAdmin) return false;
    if (this.estaCerrado() || this.estaFinalizado()) return false;
    return true;
  }

  /**
   * Solo admin puede reabrir tickets cerrados.
   */
  puedeReabrir(): boolean {
    if (!this.ticket || !this.isAdmin) return false;
    return this.estaCerrado();
  }

  eliminarTicket(): void {
    if (!this.ticket || !this.puedeEliminar()) return;

    if (!confirm(`¿Está seguro de ELIMINAR el ticket #${this.ticket.idTicket}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.loadingAction = true;
    this.ticketService.eliminarTicket(this.ticket.idTicket)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadingAction = false;
          alert('Ticket eliminado exitosamente.');
          this.router.navigate(['/mesa-ayuda']);
        },
        error: (err) => {
          console.error('Error al eliminar ticket:', err);
          this.loadingAction = false;
          if (err.status === 403) {
            alert('No tienes permisos para eliminar este ticket.');
          } else if (err.status === 400) {
            alert(err.error?.message || 'No se puede eliminar tickets del canal Correo.');
          } else {
            alert('Error al eliminar ticket: ' + (err.error?.message || err.message));
          }
        }
      });
  }

  cerrarTicketAdmin(): void {
    if (!this.ticket || !this.puedeCerrar() || !this.currentUser) return;

    if (!confirm(`¿Está seguro de CERRAR el ticket #${this.ticket.idTicket}?`)) {
      return;
    }

    this.loadingAction = true;
    this.ticketService.cerrarTicket({
      idTicket: this.ticket.idTicket,
      idUsuario: this.currentUser.codigoEmpleado
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadingAction = false;
          this.cargarDetalleTicket();
        },
        error: (err) => {
          console.error('Error al cerrar ticket:', err);
          this.loadingAction = false;
          const mensaje = err.error?.message || err.error || err.message;
          if (err.status === 403) {
            alert('No tienes permisos para cerrar este ticket.');
          } else {
            alert('Error al cerrar ticket: ' + mensaje);
          }
        }
      });
  }

  reabrirTicket(): void {
    if (!this.ticket || !this.puedeReabrir()) return;

    if (!confirm(`¿Está seguro de REABRIR el ticket #${this.ticket.idTicket}?`)) {
      return;
    }

    this.loadingAction = true;
    this.ticketService.reabrirTicket(this.ticket.idTicket)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadingAction = false;
          this.cargarDetalleTicket();
        },
        error: (err) => {
          console.error('Error al reabrir ticket:', err);
          this.loadingAction = false;
          if (err.status === 403) {
            alert('No tienes permisos para reabrir este ticket.');
          } else {
            alert('Error al reabrir ticket: ' + (err.error?.message || err.message));
          }
        }
      });
  }

  // Nuevo método para manejar errores específicos de finalización
  private manejarErrorFinalizacion(err: any): void {
    let mensaje = 'Error al finalizar ticket.';

    if (err.status === 400 && err.error?.code) {
      switch (err.error.code) {
        case 51020:
          mensaje = 'Error: El ticket especificado no existe.';
          break;
        case 51021:
          mensaje = 'Error: El ticket ya está finalizado.';
          break;
        case 51022:
          mensaje = 'Error: Existen líneas pendientes de finalización. Todas las líneas deben estar finalizadas antes de cerrar el ticket.';
          break;
        case 51023:
          mensaje = 'Error: No se puede finalizar un ticket sin líneas de trabajo.';
          break;
        default:
          mensaje = err.error.message || 'Error al finalizar ticket.';
      }
    } else if (err.status === 403) {
      mensaje = 'Error: No tiene permisos para finalizar tickets. Solo consultores y administradores pueden finalizar tickets.';
    } else {
      mensaje = err.error?.message || 'Error al finalizar ticket. Verifique que cumple con los requisitos.';
    }

    alert(mensaje);
  }

  // Métodos usando utilidades centralizadas
  getPrioridadClass(prioridad: string): string {
    return StyleUtilsService.getPrioridadClass(prioridad);
  }

  getEstadoClass(estado: string): string {
    return StyleUtilsService.getEstadoClass(estado);
  }

  formatearFecha(fecha: string): string {
    return DateUtilsService.formatearFecha(fecha);
  }

  formatearFechaCompleta(fecha: string): string {
    return DateUtilsService.formatearFechaCompleta(fecha);
  }

  // Métodos movidos al final del archivo con lógica de permisos actualizada

  puedeEditar(): boolean {
    // Solo administradores pueden editar tickets
    const esAdmin = this.isAdmin;
    const estadoPermiteEdicion = !this.estaFinalizado() &&
                                !this.estaCerrado() &&
                                this.ticket?.estado?.toLowerCase() !== 'cancelado';
    
    return esAdmin && estadoPermiteEdicion;
  }

  // Métodos para manejar niveles de atención
  cargarNivelesAtencion(): void {
    this.nivelAtencionService.obtenerNivelesAtencion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (niveles) => {
          this.nivelesAtencion = niveles;
        },
        error: (err) => {
          console.error('Error al cargar niveles de atención:', err);
        }
      });
  }

  // Métodos para manejar estados de línea
  cargarEstadosTicketLinea(): void {
    this.ticketService.obtenerEstadosTicketLinea()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estados) => {
          this.estadosTicketLinea = estados;
        },
        error: (err) => {
          console.error('Error al cargar estados de línea:', err);
        }
      });
  }

  // Getter para filtrar solo estados de finalización
  get estadosFinalizacion(): EstadoTicketLineaDto[] {
    return this.estadosTicketLinea.filter(e =>
      [3, 4, 5].includes(e.idEstadoLinea) && e.activo
    );
  }

  // Métodos para manejar archivos
  onArchivosSeleccionados(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.archivosSeleccionados = Array.from(target.files);
    }
  }

  removerArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }

  formatearTamanoArchivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatea minutos a formato legible (horas o días)
   * @param minutos - Tiempo en minutos como string
   * @returns Formato legible (Ej: "4h", "3d", "2d 12h")
   */
  formatearTiempo(minutos: string): string {
    if (!minutos) return '-';

    const mins = parseInt(minutos, 10);
    if (isNaN(mins)) return '-';

    // Menos de 60 minutos
    if (mins < 60) {
      return `${mins}min`;
    }

    // Menos de 24 horas (1440 minutos)
    if (mins < 1440) {
      const horas = Math.floor(mins / 60);
      const minutosRestantes = mins % 60;
      return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}min` : `${horas}h`;
    }

    // 24 horas o más
    const dias = Math.floor(mins / 1440);
    const horasRestantes = Math.floor((mins % 1440) / 60);
    return horasRestantes > 0 ? `${dias}d ${horasRestantes}h` : `${dias}d`;
  }

  // Métodos para manejar categorías
  cargarCategorias(): void {
    this.categoriaService.obtenerCategoriasPorNivel('P')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorias) => {
          this.categorias1 = categorias;
        },
        error: (err) => {
          console.error('Error al cargar categorías nivel 1:', err);
        }
      });
  }

  onCategoria1Change(): void {
    const categoria1Id = this.lineaForm.get('idCategoria1')?.value;
    if (categoria1Id) {
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria1Id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categorias) => {
            this.categorias2 = categorias;
            this.lineaForm.patchValue({ idCategoria2: '', idCategoria3: '' });
            this.categorias3 = [];
          },
          error: (err) => {
            console.error('Error al cargar categorías nivel 2:', err);
          }
        });
    } else {
      this.categorias2 = [];
      this.categorias3 = [];
      this.lineaForm.patchValue({ idCategoria2: '', idCategoria3: '' });
    }
  }

  onCategoria2Change(): void {
    const categoria2Id = this.lineaForm.get('idCategoria2')?.value;
    if (categoria2Id) {
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria2Id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categorias) => {
            this.categorias3 = categorias;
            this.lineaForm.patchValue({ idCategoria3: '' });
          },
          error: (err) => {
            console.error('Error al cargar categorías nivel 3:', err);
          }
        });
    } else {
      this.categorias3 = [];
      this.lineaForm.patchValue({ idCategoria3: '' });
    }
  }

  // Métodos de validación de permisos
  puedeAgregarLinea(): boolean {
    if (!this.ticket || !this.currentUser) return false;

    // Verificar que el ticket no esté finalizado/cerrado
    if (this.estaFinalizado() || this.estaCerrado() || this.ticket.estado?.toLowerCase() === 'cancelado') {
      return false;
    }

    // Debe ser administrador o consultor
    const tieneRolValido = this.isAdmin || this.isConsultor;

    // Los administradores pueden agregar líneas a cualquier ticket (si no está cerrado)
    if (this.isAdmin) {
      return tieneRolValido;
    }

    // Los consultores solo pueden agregar líneas si son el resolutor actual
    const esResolutorActual = this.ticket.idResolutorActual === this.currentUser.codigoEmpleado;

    return tieneRolValido && esResolutorActual;
  }

  puedeEditarTicket(): boolean {
    return this.isAdmin;
  }

  puedeFinalizar(): boolean {
    if (!this.ticket || !this.currentUser) return false;

    // 1. Verificar permisos (Consultor o Admin)
    const tienePermisos = this.isAdmin || this.isConsultor;

    // 2. Verificar que el ticket no esté finalizado
    const noEstaFinalizado = !this.estaFinalizado();

    // 3. Verificar que existan líneas
    const tieneLineas = this.ticket.lineasTrabajo && this.ticket.lineasTrabajo.length > 0;

    // 4. Verificar que TODAS las líneas estén finalizadas
    const todasLineasFinalizadas = this.todasLineasFinalizadas();

    return tienePermisos && noEstaFinalizado && tieneLineas && todasLineasFinalizadas;
  }

  // Método para obtener mensaje de por qué no puede agregar líneas
  getMensajeNoPermiteAgregarLineas(): string {
    if (!this.currentUser) return 'Usuario no autenticado';

    if (!this.isAdmin && !this.isConsultor) {
      return 'Solo administradores y consultores pueden agregar líneas';
    }

    if (!this.isAdmin && this.ticket && this.ticket.idResolutorActual !== this.currentUser.codigoEmpleado) {
      return 'Solo el resolutor actual del ticket puede agregar líneas (los administradores pueden agregar líneas a cualquier ticket)';
    }

    return 'No tienes permisos para agregar líneas a este ticket';
  }

  // Método para obtener información del estado de finalización
  getEstadoFinalizacion(): { puedeFinalizarTicket: boolean; mensaje: string } {
    if (!this.ticket || !this.currentUser) {
      return { puedeFinalizarTicket: false, mensaje: 'Información del ticket no disponible' };
    }

    // Verificar permisos de usuario
    const tienePermisos = this.isAdmin || this.isConsultor;
    if (!tienePermisos) {
      return {
        puedeFinalizarTicket: false,
        mensaje: 'Solo administradores y consultores pueden finalizar tickets'
      };
    }

    // Verificar estado del ticket
    if (this.estaFinalizado()) {
      return { puedeFinalizarTicket: false, mensaje: 'El ticket ya está finalizado' };
    }

    // Verificar líneas de trabajo
    if (!this.ticket.lineasTrabajo || this.ticket.lineasTrabajo.length === 0) {
      return {
        puedeFinalizarTicket: false,
        mensaje: 'El ticket debe tener al menos una línea de trabajo'
      };
    }

    // Verificar estado de las líneas usando la misma lógica que todasLineasFinalizadas()
    const lineasNoFinalizadas = this.ticket.lineasTrabajo.filter(linea =>
      !this.esLineaFinalizada(linea)
    );

    if (lineasNoFinalizadas.length > 0) {
      return {
        puedeFinalizarTicket: false,
        mensaje: `Hay ${lineasNoFinalizadas.length} línea(s) pendiente(s) de finalizar`
      };
    }

    return { puedeFinalizarTicket: true, mensaje: 'Todas las condiciones se cumplen' };
  }

  // Método helper para verificar si todas las líneas están finalizadas (para el template)
  todasLineasFinalizadas(): boolean {
    if (!this.ticket?.lineasTrabajo || this.ticket.lineasTrabajo.length === 0) {
      return false;
    }

    return this.ticket.lineasTrabajo.every(linea => this.esLineaFinalizada(linea));
  }

  // Helper canónico: una línea está finalizada si su ID de estado es 3 (RESUELTO),
  // 4 (CANCELADO/ANULADO) o 5 (ESCALADO). Acepta también el string del estado por
  // resiliencia (DB puede traer RESUELTA/RESUELTO o ANULADO/CANCELADO).
  private esLineaFinalizada(linea: any): boolean {
    if (!linea) return false;
    const idsFinalizados = [3, 4, 5];
    if (typeof linea.idEstadoLinea === 'number' && idsFinalizados.includes(linea.idEstadoLinea)) {
      return true;
    }
    const estadosFinalizadosStr = ['RESUELTO', 'RESUELTA', 'CANCELADO', 'ANULADO', 'ESCALADO'];
    const estadoNorm = typeof linea.estado === 'string' ? linea.estado.trim().toUpperCase() : '';
    const nombreEstadoNorm = typeof linea.nombreEstadoLinea === 'string'
      ? linea.nombreEstadoLinea.trim().toUpperCase()
      : '';
    return estadosFinalizadosStr.includes(estadoNorm) || estadosFinalizadosStr.includes(nombreEstadoNorm);
  }

  // Métodos para finalizar líneas
  puedefinalizarLinea(linea: any): boolean {
    if (!this.currentUser || !linea) return false;

    if (this.esLineaFinalizada(linea)) return false;

    // Debe tener permisos (admin o consultor)
    const tieneRolValido = this.isAdmin || this.isConsultor;

    // Los administradores pueden finalizar cualquier línea
    if (this.isAdmin) {
      return tieneRolValido;
    }

    // Los consultores pueden finalizar líneas donde son resolutores
    // Intentar validar por ID primero, luego por nombre como fallback
    let esResolutorLinea = false;

    // Validación por ID (más confiable)
    if (linea.idResolutor && this.currentUser.codigoEmpleado) {
      esResolutorLinea = linea.idResolutor === this.currentUser.codigoEmpleado;
    }

    // Fallback: Validación por nombre si no hay ID o no coincidió
    if (!esResolutorLinea && linea.nombreResolutor && this.currentUser.nombreCompleto) {
      esResolutorLinea = linea.nombreResolutor.toLowerCase().includes(this.currentUser.nombreCompleto.toLowerCase());
    }

    return tieneRolValido && esResolutorLinea;
  }

  abrirModalFinalizarLinea(linea: any): void {
    this.lineaSeleccionada = linea;
    this.showFinalizarModal = true;

    // Resetear formulario
    this.finalizarLineaForm.reset({
      tiempoReal: '',
      idEstadoLinea: '',
      resolucion: ''
    });
  }

  cerrarModalFinalizarLinea(): void {
    this.showFinalizarModal = false;
    this.lineaSeleccionada = null;
    this.finalizarLineaForm.reset();
  }

  confirmarFinalizarLinea(): void {
    if (this.finalizarLineaForm.valid && this.lineaSeleccionada) {
      this.loadingAction = true;

      const tiempoReal = parseFloat(this.finalizarLineaForm.value.tiempoReal);
      const idEstadoLinea = parseInt(this.finalizarLineaForm.value.idEstadoLinea);
      const resolucion = this.finalizarLineaForm.value.resolucion;

      // Obtener el ID de línea, preferiblemente idTicketLinea
      let idTicketLinea = this.lineaSeleccionada.idTicketLinea;

      if (!idTicketLinea) {
        // Si no hay idTicketLinea, mostrar mensaje de advertencia y usar el nroLinea
        console.warn('No se encontró idTicketLinea, usando nroLinea como fallback');
        idTicketLinea = this.lineaSeleccionada.nroLinea;
      }

      // Usar actualizarLinea directamente con todos los campos
      const actualizarDto = {
        idTicketLinea,
        idEstadoLinea,
        tiempoReal,
        resolucion
      };

      this.ticketService.actualizarLinea(actualizarDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadingAction = false;
            this.cerrarModalFinalizarLinea();
            this.cargarDetalleTicket(); // Recargar para ver los cambios
          },
          error: (err) => {
            console.error('Error al finalizar línea:', err);
            this.loadingAction = false;

            if (err.status === 401) {
              alert('No tienes permisos para finalizar esta línea.');
            } else if (err.status === 404) {
              alert('La línea no fue encontrada.');
            } else {
              alert('Error al finalizar línea: ' + (err.error?.message || err.message));
            }
          }
        });
    }
  }

  // ============================
  // Etapas del Proyecto
  // ============================

  get etapasFormGroups(): FormGroup[] {
    return this.etapasForm.controls as FormGroup[];
  }

  private aplicarValidadorEtapaLinea(): void {
    const ctrl = this.lineaForm.get('idProyectoEtapa');
    if (!ctrl) return;
    if (this.ticket?.idProyecto) {
      ctrl.setValidators([Validators.required]);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  cargarEtapasProyecto(idProyecto: string): void {
    this.loadingEtapas = true;
    this.proyectoEtapaService.obtenerEtapasPorProyecto(idProyecto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (etapas) => {
          this.etapasProyecto = etapas ?? [];
          this.loadingEtapas = false;
        },
        error: (err) => {
          console.error('Error al cargar etapas del proyecto:', err);
          this.etapasProyecto = [];
          this.loadingEtapas = false;
        }
      });
  }

  iniciarEdicionEtapas(): void {
    if (!this.isAdmin) return;

    // Sembrar desde etapasProyecto. El backend ahora pre-siembra las 5 bases
    // al crear el proyecto, así que aquí no necesitamos catálogo estático.
    const fuente = [...this.etapasProyecto].sort((a, b) => a.orden - b.orden);

    this.etapasForm = this.fb.array(
      fuente.map(et => this.crearGrupoEtapa(et))
    );
    this.editandoEtapas = true;
  }

  private crearGrupoEtapa(et: Partial<ProyectoEtapaDto>): FormGroup {
    return this.fb.group({
      idProyectoEtapa: [et.idProyectoEtapa ?? null],
      idEtapa: [et.idEtapa ?? null],
      nombre: [
        et.nombre ?? '',
        [Validators.required, Validators.maxLength(120)]
      ],
      orden: [et.orden ?? (this.etapasForm?.length ? this.etapasForm.length + 1 : 1)],
      esBase: [et.esBase ?? false],
      fechaInicioPlaneada: [DateUtilsService.aInputDateString(et.fechaInicioPlaneada)],
      fechaFinPlaneada: [DateUtilsService.aInputDateString(et.fechaFinPlaneada)],
      horasPlaneadas: [et.horasPlaneadas ?? null, [Validators.min(0)]],
      eliminar: [false],
      cantidadLineas: [et.cantidadLineas ?? 0]
    });
  }

  agregarEtapa(): void {
    if (!this.editandoEtapas) return;
    const siguienteOrden = this.etapasForm.length + 1;
    this.etapasForm.push(this.crearGrupoEtapa({
      idEtapa: null,
      nombre: '',
      orden: siguienteOrden,
      esBase: false,
      fechaInicioPlaneada: null,
      fechaFinPlaneada: null,
      horasPlaneadas: null,
      cantidadLineas: 0
    }));
  }

  marcarEliminarEtapa(idx: number): void {
    const grp = this.etapasFormGroups[idx];
    if (!grp) return;
    const esBase = grp.value.esBase;
    if (esBase) return;
    const cantidadLineas = grp.value.cantidadLineas ?? 0;
    if (cantidadLineas > 0) {
      alert('No se puede eliminar una etapa que tiene líneas de trabajo asociadas.');
      return;
    }
    const idProyectoEtapa = grp.value.idProyectoEtapa;
    if (idProyectoEtapa) {
      // Persistida: marcar como eliminar para que el SP la borre.
      grp.patchValue({ eliminar: true });
    } else {
      // Aún no persistida: simplemente quitarla del FormArray.
      this.etapasForm.removeAt(idx);
      this.recalcularOrden();
    }
  }

  restaurarEtapa(idx: number): void {
    const grp = this.etapasFormGroups[idx];
    if (!grp) return;
    grp.patchValue({ eliminar: false });
  }

  onDropEtapa(event: CdkDragDrop<FormGroup[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const controles = this.etapasForm.controls;
    const movido = controles[event.previousIndex];
    controles.splice(event.previousIndex, 1);
    controles.splice(event.currentIndex, 0, movido);
    this.etapasForm.updateValueAndValidity();
    this.recalcularOrden();
    this.recalcularFechasSugeridas();
  }

  private recalcularOrden(): void {
    this.etapasFormGroups.forEach((grp, idx) => {
      grp.patchValue({ orden: idx + 1 }, { emitEvent: false });
    });
  }

  onFechaFinChange(idx: number): void {
    this.recalcularFechasSugeridas(idx);
  }

  /**
   * Recorre el FormArray ordenado y, si una etapa tiene fechaFin y la siguiente
   * etapa (no eliminada) tiene fechaInicio vacía, sugiere el siguiente día hábil.
   * Si `desdeIndice` se pasa, solo recalcula desde ahí en adelante.
   */
  private recalcularFechasSugeridas(desdeIndice: number = 0): void {
    const grupos = this.etapasFormGroups.filter(g => !g.value.eliminar);
    for (let i = Math.max(0, desdeIndice); i < grupos.length - 1; i++) {
      const actual = grupos[i];
      const siguiente = grupos[i + 1];
      const fechaFin = actual.value.fechaFinPlaneada;
      const fechaInicioSig = siguiente.value.fechaInicioPlaneada;
      if (fechaFin && !fechaInicioSig) {
        const sugerida = DateUtilsService.siguienteDiaHabil(fechaFin, this.feriadosSet);
        siguiente.patchValue(
          { fechaInicioPlaneada: DateUtilsService.aInputDateString(sugerida) },
          { emitEvent: false }
        );
      }
    }
  }

  cancelarEdicionEtapas(): void {
    this.editandoEtapas = false;
    this.etapasForm = this.fb.array([]);
  }

  guardarEtapas(): void {
    if (!this.ticket?.idProyecto || !this.isAdmin || this.etapasForm.invalid) return;

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, ConfirmDialogResult>(
      ConfirmDialogComponent,
      {
        data: {
          titulo: 'Guardar etapas del proyecto',
          mensaje: '¿Deseas generar una nueva versión histórica de las etapas antes de aplicar los cambios?',
          textoSi: 'Sí, crear versión',
          textoNo: 'No, solo actualizar',
          pedirMotivo: true,
          motivoLabel: 'Motivo de la versión (opcional)',
          motivoMaxLength: 255
        },
        width: '520px'
      }
    );

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(resultado => {
      if (!resultado) return;
      this.persistirEtapas(resultado.confirmado, resultado.motivo);
    });
  }

  private persistirEtapas(crearVersion: boolean, motivoVersion?: string): void {
    if (!this.ticket?.idProyecto) return;

    const request: UpsertEtapasProyectoRequest = {
      etapas: this.etapasFormGroups.map((grp, idx): UpsertEtapaItemRequest => {
        const v = grp.value;
        return {
          idProyectoEtapa: v.idProyectoEtapa ?? null,
          idEtapa: v.idEtapa ?? null,
          nombre: (v.nombre ?? '').trim(),
          orden: idx + 1,
          esBase: !!v.esBase,
          fechaInicioPlaneada: v.fechaInicioPlaneada || null,
          fechaFinPlaneada: v.fechaFinPlaneada || null,
          horasPlaneadas: v.horasPlaneadas === '' || v.horasPlaneadas === null || v.horasPlaneadas === undefined
            ? null
            : parseFloat(v.horasPlaneadas),
          eliminar: !!v.eliminar
        };
      }),
      crearVersion,
      motivoVersion: motivoVersion?.trim() || null
    };

    this.guardandoEtapas = true;
    this.proyectoEtapaService.guardarEtapasProyecto(this.ticket.idProyecto, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (etapas) => {
          this.etapasProyecto = etapas ?? [];
          this.editandoEtapas = false;
          this.guardandoEtapas = false;
          if (this.ticket?.idProyecto) {
            this.cargarVersionesEtapas(this.ticket.idProyecto);
          }
        },
        error: (err) => {
          console.error('Error al guardar etapas:', err);
          this.guardandoEtapas = false;
          alert('Error al guardar las etapas del proyecto: ' + (err.error?.message || err.message));
        }
      });
  }

  // ============================
  // Feriados
  // ============================

  private cargarFeriados(): void {
    this.calendarioService.obtenerFeriados()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (feriados: FeriadoDto[]) => {
          this.feriadosSet = new Set(
            (feriados ?? []).map(f => DateUtilsService.aInputDateString(f.fecha))
          );
        },
        error: (err) => {
          console.error('Error al cargar feriados:', err);
          this.feriadosSet = new Set();
        }
      });
  }

  // ============================
  // Versiones históricas
  // ============================

  cargarVersionesEtapas(idProyecto: string): void {
    this.loadingVersiones = true;
    this.proyectoEtapaService.listarVersiones(idProyecto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (versiones) => {
          this.versionesEtapas = versiones ?? [];
          this.loadingVersiones = false;
        },
        error: (err) => {
          console.error('Error al cargar versiones de etapas:', err);
          this.versionesEtapas = [];
          this.loadingVersiones = false;
        }
      });
  }

  toggleMostrarVersiones(): void {
    this.mostrarVersiones = !this.mostrarVersiones;
    if (!this.mostrarVersiones) {
      this.versionSeleccionada = null;
      this.detalleVersion = [];
    }
  }

  verDetalleVersion(version: ProyectoEtapaVersionDto): void {
    if (!this.ticket?.idProyecto) return;
    this.versionSeleccionada = version;
    this.detalleVersion = [];
    this.loadingDetalleVersion = true;
    this.proyectoEtapaService.obtenerDetalleVersion(this.ticket.idProyecto, version.idVersion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detalle) => {
          this.detalleVersion = detalle ?? [];
          this.loadingDetalleVersion = false;
        },
        error: (err) => {
          console.error('Error al obtener detalle de versión:', err);
          this.detalleVersion = [];
          this.loadingDetalleVersion = false;
        }
      });
  }

  cerrarDetalleVersion(): void {
    this.versionSeleccionada = null;
    this.detalleVersion = [];
  }

  formatearFechaCorta(fecha?: string | null): string {
    if (!fecha) return '-';
    const f = new Date(fecha);
    if (isNaN(f.getTime())) return '-';
    return DateUtilsService.formatearFecha(f.toISOString());
  }
}