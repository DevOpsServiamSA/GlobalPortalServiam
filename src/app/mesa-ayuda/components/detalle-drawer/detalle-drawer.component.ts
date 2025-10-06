import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NivelAtencionService } from '../../services/nivelAtencion.service';
// import { EstadoTicketService } from '../../services/estadoTicket.service'; // Ya no se usa para líneas
import { CategoriaService } from '../../services/categoria.service';
import { TicketDetalleDto, AgregarLineaDto, nivelAtencionDto, EstadoTicketDto, EstadoTicketLineaDto, Categoria } from '../../models';
import { StyleUtilsService, DateUtilsService } from '../../utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
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

      this.ticketService.finalizarLineaConTiempoReal(idTicketLinea, tiempoReal, resolucion).subscribe({
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
}