import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProyectoEtapaService } from '../../services/proyectoEtapa.service';
import { CalendarioService } from '../../services/calendario.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  ConfirmDialogResult
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-detalle-drawer',
  templateUrl: './detalle-drawer.component.html',
  styleUrls: ['./detalle-drawer.component.css'],
  standalone: false
})
export class DetalleDrawerComponent implements OnInit, OnChanges {
  @Input() ticketId!: number;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<void>();

  ticket: TicketDetalleDto | null = null;
  loading = true;
  error = false;
  
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

  ngOnInit(): void {
    // Inicializar permisos
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.hasRole('administrador');
    this.isConsultor = this.authService.hasRole('consultor');

    this.cargarNivelesAtencion();
    this.cargarEstadosTicketLinea();
    this.cargarCategorias();
    if (this.ticketId) {
      this.cargarDetalleTicket();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketId'] && !changes['ticketId'].firstChange) {
      this.cargarDetalleTicket();
    }
  }

  cargarDetalleTicket(): void {
    this.loading = true;
    this.error = false;

    this.ticketService.obtenerDetalleTicket(this.ticketId).subscribe({
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

  cerrarDrawer(): void {
    this.close.emit();
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

      this.ticketService.agregarLineaConArchivos(this.ticket.idTicket, formData).subscribe({
        next: () => {
          this.loadingAction = false;
          this.ocultarFormularioLinea();
          this.cargarDetalleTicket(); // Recargar para ver la nueva línea
          this.ticketUpdated.emit(); // Notificar al dashboard para actualizar lista
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

      this.ticketService.finalizarTicketNuevo(this.ticket.idTicket).subscribe({
        next: () => {
          this.loadingAction = false;
          this.cargarDetalleTicket(); // Recargar para ver el cambio de estado
          this.ticketUpdated.emit(); // Notificar al dashboard para actualizar lista
        },
        error: (err) => {
          console.error('Error al finalizar ticket:', err);
          this.loadingAction = false;

          // Manejo específico de errores
          if (err.status === 403) {
            let mensaje = 'No tienes permisos para finalizar este ticket.';

            if (err.error?.code) {
              switch (err.error.code) {
                case 51020:
                  mensaje = 'No tienes permisos suficientes para finalizar tickets.';
                  break;
                case 51021:
                  mensaje = 'El ticket ya está finalizado.';
                  break;
                case 51022:
                  mensaje = 'No se pueden finalizar tickets sin líneas de trabajo.';
                  break;
                case 51023:
                  mensaje = 'Todas las líneas de trabajo deben estar finalizadas antes de cerrar el ticket.';
                  break;
              }
            }

            alert(mensaje);
          } else {
            alert('Error al finalizar ticket: ' + (err.error?.message || err.message));
          }
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

  private estaCerrado(): boolean {
    if (!this.ticket) return false;
    return this.ticket.estado === 'C' || this.ticket.estado === 'CERRADO';
  }

  private estaFinalizado(): boolean {
    if (!this.ticket) return false;
    return this.ticket.estado === 'F' || this.ticket.estado === 'FINALIZADO';
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
    this.ticketService.eliminarTicket(this.ticket.idTicket).subscribe({
      next: () => {
        this.loadingAction = false;
        alert('Ticket eliminado exitosamente.');
        this.ticketUpdated.emit();
        this.close.emit();
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
    }).subscribe({
      next: () => {
        this.loadingAction = false;
        this.cargarDetalleTicket();
        this.ticketUpdated.emit();
      },
      error: (err) => {
        console.error('Error al cerrar ticket:', err);
        this.loadingAction = false;
        if (err.status === 403) {
          alert('No tienes permisos para cerrar este ticket.');
        } else {
          alert('Error al cerrar ticket: ' + (err.error?.message || err.message));
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
    this.ticketService.reabrirTicket(this.ticket.idTicket).subscribe({
      next: () => {
        this.loadingAction = false;
        this.cargarDetalleTicket();
        this.ticketUpdated.emit();
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

  // Métodos para manejar niveles de atención
  cargarNivelesAtencion(): void {
    this.nivelAtencionService.obtenerNivelesAtencion().subscribe({
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
    this.ticketService.obtenerEstadosTicketLinea().subscribe({
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
    this.categoriaService.obtenerCategoriasPorNivel('P').subscribe({
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
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria1Id)).subscribe({
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
      this.categoriaService.obtenerCategoriasHijas(parseInt(categoria2Id)).subscribe({
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
    const estadosNoPermitidos = ['FINALIZADO', 'F', 'CERRADO', 'CANCELADO'];
    if (estadosNoPermitidos.includes(this.ticket.estado)) {
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

  puedeEditar(): boolean {
    // Solo administradores pueden editar tickets
    const esAdmin = this.isAdmin;
    const estadoPermiteEdicion = this.ticket?.estado !== 'FINALIZADO' && 
                                this.ticket?.estado !== 'CANCELADO' && 
                                this.ticket?.estado !== 'CERRADO';
    
    return esAdmin && estadoPermiteEdicion;
  }

  puedeFinalizar(): boolean {
    if (!this.ticket || !this.currentUser) return false;

    // Usuario debe tener permisos (administrador o consultor)
    const tienePermisos = this.isAdmin || this.isConsultor;

    // Ticket no debe estar finalizado
    const noEstaFinalizado = this.ticket.estado !== 'FINALIZADO' && this.ticket.estado !== 'F';

    // Debe tener al menos una línea de trabajo
    const tieneLineas = this.ticket.lineasTrabajo && this.ticket.lineasTrabajo.length > 0;

    // Todas las líneas deben estar finalizadas
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

  // Método para obtener el estado de finalización del ticket
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
    if (this.ticket.estado === 'FINALIZADO' || this.ticket.estado === 'F') {
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
    console.log('=== DEBUG puedefinalizarLinea ===');
    console.log('Usuario actual:', this.currentUser);
    console.log('Línea:', linea);
    console.log('isAdmin:', this.isAdmin);
    console.log('isConsultor:', this.isConsultor);

    if (!this.currentUser || !linea) {
      console.log('❌ No hay usuario o línea');
      return false;
    }

    // Solo mostrar botón si la línea no está finalizada.
    // Validar por ID estable (3=RESUELTO, 4=CANCELADO/ANULADO, 5=ESCALADO) en
    // lugar del string del estado, que puede variar (RESUELTO/RESUELTA, etc.).
    const estaFinalizada = this.esLineaFinalizada(linea);

    console.log('¿Está finalizada?:', estaFinalizada, '- Estado:', linea.estado, '- IdEstado:', linea.idEstadoLinea);
    if (estaFinalizada) {
      console.log('❌ La línea ya está finalizada');
      return false;
    }

    // Debe tener permisos (admin o consultor)
    const tieneRolValido = this.isAdmin || this.isConsultor;
    console.log('¿Tiene rol válido?:', tieneRolValido);

    // Los administradores pueden finalizar cualquier línea
    if (this.isAdmin) {
      console.log('✅ Es admin, puede finalizar');
      return tieneRolValido;
    }

    // Los consultores pueden finalizar líneas donde son resolutores
    // Intentar validar por ID primero, luego por nombre como fallback
    let esResolutorLinea = false;

    // Validación por ID (más confiable)
    if (linea.idResolutor && this.currentUser.codigoEmpleado) {
      esResolutorLinea = linea.idResolutor === this.currentUser.codigoEmpleado;
      console.log('Validación por ID:', {
        idResolutorLinea: linea.idResolutor,
        codigoEmpleado: this.currentUser.codigoEmpleado,
        coincide: esResolutorLinea
      });
    }

    // Fallback: Validación por nombre si no hay ID o no coincidió
    if (!esResolutorLinea && linea.nombreResolutor && this.currentUser.nombreCompleto) {
      esResolutorLinea = linea.nombreResolutor.toLowerCase().includes(this.currentUser.nombreCompleto.toLowerCase());
      console.log('Validación por nombre (fallback):', {
        nombreResolutorLinea: linea.nombreResolutor,
        nombreCompleto: this.currentUser.nombreCompleto,
        coincide: esResolutorLinea
      });
    }

    console.log('¿Es resolutor de la línea?:', esResolutorLinea);
    const resultado = tieneRolValido && esResolutorLinea;
    console.log('Resultado final:', resultado ? '✅ PUEDE finalizar' : '❌ NO PUEDE finalizar');

    return resultado;
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

      this.ticketService.actualizarLinea(actualizarDto).subscribe({
        next: () => {
          this.loadingAction = false;
          this.cerrarModalFinalizarLinea();
          this.cargarDetalleTicket(); // Recargar para ver los cambios
          this.ticketUpdated.emit(); // Notificar al dashboard para actualizar lista
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
    this.proyectoEtapaService.obtenerEtapasPorProyecto(idProyecto).subscribe({
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
      grp.patchValue({ eliminar: true });
    } else {
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

    dialogRef.afterClosed().subscribe(resultado => {
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
    this.proyectoEtapaService.guardarEtapasProyecto(this.ticket.idProyecto, request).subscribe({
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
    this.calendarioService.obtenerFeriados().subscribe({
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
    this.proyectoEtapaService.listarVersiones(idProyecto).subscribe({
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
    this.proyectoEtapaService.obtenerDetalleVersion(this.ticket.idProyecto, version.idVersion).subscribe({
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