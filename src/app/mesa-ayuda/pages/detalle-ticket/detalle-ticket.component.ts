import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NivelAtencionService } from '../../services/nivelAtencion.service';
// import { EstadoTicketService } from '../../services/estadoTicket.service'; // Ya no se usa para líneas
import { CategoriaService } from '../../services/categoria.service';
import { TicketDetalleDto, AgregarLineaDto, nivelAtencionDto, EstadoTicketDto, EstadoTicketLineaDto, Categoria } from '../../models';
import { StyleUtilsService, DateUtilsService } from '../../utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private nivelAtencionService: NivelAtencionService,
    // private estadoTicketService: EstadoTicketService, // Ya no se usa para líneas
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {
    this.lineaForm = this.fb.group({
      tiempoProyectado: [0, [Validators.required, Validators.min(0.1)]],
      idNivelAtencion: ['', Validators.required],
      resolucion: [''],
      idEstadoLinea: ['', Validators.required],
      idCategoria1: [''],
      idCategoria2: [''],
      idCategoria3: ['']
    });

    this.finalizarLineaForm = this.fb.group({
      tiempoReal: ['', [Validators.required, Validators.min(0.1)]],
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
      idCategoria3: ''
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
        IdCategoria3: this.lineaForm.value.idCategoria3 ? parseInt(this.lineaForm.value.idCategoria3) : null
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
    const estadoPermiteEdicion = this.ticket?.estado !== 'FINALIZADO' && 
                                this.ticket?.estado !== 'CANCELADO' && 
                                this.ticket?.estado !== 'CERRADO';
    
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

  puedeEditarTicket(): boolean {
    return this.isAdmin;
  }

  puedeFinalizar(): boolean {
    if (!this.ticket || !this.currentUser) return false;

    // 1. Verificar permisos (Consultor o Admin)
    const tienePermisos = this.isAdmin || this.isConsultor;

    // 2. Verificar que el ticket no esté finalizado
    const noEstaFinalizado = this.ticket.estado !== 'FINALIZADO' && this.ticket.estado !== 'F';

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
      // Si NO cumple ninguna de las condiciones de finalización
      !(
        // Validaciones para nuevos campos del backend
        linea.idEstadoLinea === 6 ||
        linea.nombreEstadoLinea === 'FINALIZADO' ||
        (linea.tiempoReal !== undefined && linea.tiempoReal !== null) ||

        // Validaciones para campos actuales del JSON
        linea.estado === 'FINALIZADO' ||
        (linea.tiempoHoras !== undefined && linea.tiempoHoras > 0) ||
        linea.fechaFinalizacion
      )
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

    return this.ticket.lineasTrabajo.every(linea =>
      // Validaciones para nuevos campos del backend
      linea.idEstadoLinea === 6 ||
      linea.nombreEstadoLinea === 'FINALIZADO' ||
      (linea.tiempoReal !== undefined && linea.tiempoReal !== null) ||

      // Validaciones para campos actuales del JSON
      linea.estado === 'FINALIZADO' ||
      (linea.tiempoHoras !== undefined && linea.tiempoHoras > 0) ||
      linea.fechaFinalizacion
    );
  }

  // Métodos para finalizar líneas
  puedefinalizarLinea(linea: any): boolean {
    if (!this.currentUser || !linea) return false;

    // Solo mostrar botón si la línea no está finalizada
    const estaFinalizada =
      // Validaciones para nuevos campos del backend
      linea.tiempoReal ||
      linea.idEstadoLinea === 6 ||
      linea.nombreEstadoLinea === 'FINALIZADO' ||

      // Validaciones para campos actuales del JSON
      linea.estado === 'FINALIZADO' ||
      (linea.tiempoHoras !== undefined && linea.tiempoHoras > 0) ||
      linea.fechaFinalizacion;

    if (estaFinalizada) return false;

    // Debe tener permisos (admin o consultor)
    const tieneRolValido = this.isAdmin || this.isConsultor;

    // Los administradores pueden finalizar cualquier línea
    if (this.isAdmin) {
      return tieneRolValido;
    }

    // Los consultores solo pueden finalizar líneas donde son resolutores
    const esResolutorLinea = linea.nombreResolutor &&
                            this.currentUser.nombreCompleto &&
                            linea.nombreResolutor.toLowerCase().includes(this.currentUser.nombreCompleto.toLowerCase());

    return tieneRolValido && esResolutorLinea;
  }

  abrirModalFinalizarLinea(linea: any): void {
    this.lineaSeleccionada = linea;
    this.showFinalizarModal = true;

    // Resetear formulario
    this.finalizarLineaForm.reset({
      tiempoReal: '',
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
      const resolucion = this.finalizarLineaForm.value.resolucion;

      // Obtener el ID de línea, preferiblemente idTicketLinea
      let idTicketLinea = this.lineaSeleccionada.idTicketLinea;

      if (!idTicketLinea) {
        // Si no hay idTicketLinea, mostrar mensaje de advertencia y usar el nroLinea
        console.warn('No se encontró idTicketLinea, usando nroLinea como fallback');
        idTicketLinea = this.lineaSeleccionada.nroLinea;
      }

      this.ticketService.finalizarLineaConTiempoReal(idTicketLinea, tiempoReal, resolucion)
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
}