import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketDashboardDto, DashboardFilters, TicketDashboardPaginatedDto } from '../../models';
import { StyleUtilsService, DateUtilsService } from '../../utils';
import { UserInfo } from '../../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  tickets: TicketDashboardDto[] = [];
  loading = true;
  filteredTickets: TicketDashboardDto[] = [];
  
  // Control del drawer
  showDrawer = false;
  selectedTicketId: number | null = null;
  
  // Filtros
  searchTerm = '';
  selectedEstado = 'todos';
  selectedPrioridad = 'todas';

  // Estados disponibles para filtro
  estadosDisponibles: string[] = [];
  prioridadesDisponibles: string[] = [];

  // Modo de vista
  viewMode: 'mosaic' | 'table' = 'mosaic';

  // Paginación
  usePagination = true; // Toggle para usar paginación o modo anterior
  paginatedData: TicketDashboardPaginatedDto | null = null;
  currentFilters: DashboardFilters = {
    page: 1,
    pageSize: 12,
    sortBy: 'fechaCreacion',
    sortDirection: 'desc'
  };
  
  // Opciones de tamaño de página
  pageSizeOptions = [6, 12, 24, 48];

  // Exponer Math para uso en template
  Math = Math;

  // Variables para control de roles
  currentUser: UserInfo | null = null;
  isAdmin = false;
  isConsultor = false;
  hasBothRoles = false;
  
  // Control de vista para usuarios con ambos roles
  showingAllTickets = true; // Por defecto mostrar todos (modo admin)

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserRoles();
    this.cargarTickets();
  }

  initializeUserRoles(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.isAdmin = this.authService.hasRole('administrador');
      this.isConsultor = this.authService.hasRole('consultor');
      this.hasBothRoles = this.isAdmin && this.isConsultor;
      
      // Si solo es consultor, por defecto mostrar sus tickets
      if (this.isConsultor && !this.isAdmin) {
        this.showingAllTickets = false;
      }
    }
  }

  cargarTickets(): void {
    console.log('cargarTickets - usePagination:', this.usePagination); // Debug log
    if (this.usePagination) {
      console.log('Cargando tickets paginados...'); // Debug log
      this.cargarTicketsPaginados();
    } else {
      console.log('Cargando tickets completos...'); // Debug log
      this.cargarTicketsCompletos();
    }
  }

  cargarTicketsCompletos(): void {
    this.loading = true;
    
    // Determinar si se debe filtrar por resolutor
    const idResolutor = this.getIdResolutorForFilter();
    
    this.ticketService.obtenerDashboard(idResolutor).subscribe({
      next: (data) => {
        this.tickets = data;
        this.filteredTickets = [...data];
        this.extractFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener tickets:', err);
        this.loading = false;
      }
    });
  }

  cargarTicketsPaginados(): void {
    this.loading = true;
    
    // Determinar si se debe filtrar por resolutor
    const idResolutor = this.getIdResolutorForFilter();
    
    // Convertir filtros locales a filtros de API
    const apiFilters: DashboardFilters = {
      ...this.currentFilters,
      estado: this.selectedEstado !== 'todos' ? this.selectedEstado : undefined,
      prioridad: this.selectedPrioridad !== 'todas' ? this.selectedPrioridad : undefined,
      busqueda: this.searchTerm || undefined,
      idResolutor: idResolutor
    };

    console.log('API Filters:', apiFilters); // Debug log

    this.ticketService.obtenerDashboardPaginado(apiFilters).subscribe({
      next: (data) => {
        console.log('Datos paginados recibidos:', data); // Debug log
        this.paginatedData = data;
        this.tickets = data.data;
        this.filteredTickets = data.data;
        this.extractFiltersFromPaginatedData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener tickets paginados:', err);
        console.error('Detalles del error:', err.status, err.statusText, err.message);
        this.loading = false;
        
        // En caso de error, volver al modo normal
        console.log('Fallback al modo normal por error en paginación');
        this.usePagination = false;
        this.cargarTicketsCompletos();
      }
    });
  }

  extractFilters(): void {
    // Extraer estados únicos
    this.estadosDisponibles = [...new Set(this.tickets.map(t => t.estado))];
    // Extraer prioridades únicas
    this.prioridadesDisponibles = [...new Set(this.tickets.map(t => t.prioridad))];
  }

  extractFiltersFromPaginatedData(): void {
    // En modo paginado, los filtros se extraen de la página actual
    // En producción se podrían obtener desde un endpoint separado
    this.extractFilters();
  }

  aplicarFiltros(): void {
    if (this.usePagination) {
      // En modo paginado, resetear a la primera página y recargar
      this.currentFilters.page = 1;
      this.cargarTicketsPaginados();
    } else {
      // Filtrado local (modo anterior)
      this.filteredTickets = this.tickets.filter(ticket => {
        const matchesSearch = ticket.usuarioAfectado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             ticket.nombreEmpresa.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             ticket.idTicket.toString().includes(this.searchTerm);
        
        const matchesEstado = this.selectedEstado === 'todos' || ticket.estado === this.selectedEstado;
        const matchesPrioridad = this.selectedPrioridad === 'todas' || ticket.prioridad === this.selectedPrioridad;

        return matchesSearch && matchesEstado && matchesPrioridad;
      });
    }
  }

  onSearchChange(): void {
    this.aplicarFiltros();
  }

  onEstadoChange(): void {
    this.aplicarFiltros();
  }

  onPrioridadChange(): void {
    this.aplicarFiltros();
  }

  // Métodos de paginación
  togglePagination(): void {
    this.usePagination = !this.usePagination;
    
    // Solo resetear filtros de paginación si se está activando por primera vez
    if (this.usePagination && !this.paginatedData) {
      this.currentFilters = {
        page: 1,
        pageSize: 12,
        sortBy: 'fechaCreacion',
        sortDirection: 'desc'
      };
      console.log('Resetting pagination filters to defaults');
    }
    
    console.log('Toggle pagination:', this.usePagination, 'current pageSize:', this.currentFilters.pageSize); // Debug log
    this.cargarTickets();
  }

  onPageChange(page: number): void {
    if (this.usePagination && page !== this.currentFilters.page) {
      this.currentFilters.page = page;
      this.cargarTicketsPaginados();
    }
  }

  onPageSizeChange(pageSize: number | string): void {
    const numericPageSize = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    console.log('onPageSizeChange called with:', pageSize, 'numeric:', numericPageSize, 'current:', this.currentFilters.pageSize);
    
    if (this.usePagination && numericPageSize !== this.currentFilters.pageSize) {
      this.currentFilters.pageSize = numericPageSize;
      this.currentFilters.page = 1; // Resetear a la primera página
      console.log('Page size changed to:', numericPageSize);
      this.cargarTicketsPaginados();
    }
  }

  onPageSizeSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.onPageSizeChange(+select.value);
    }
  }

  onSortChange(sortBy: string, sortDirection?: 'asc' | 'desc'): void {
    if (this.usePagination) {
      this.currentFilters.sortBy = sortBy;
      this.currentFilters.sortDirection = sortDirection || 'desc';
      this.currentFilters.page = 1; // Resetear a la primera página
      this.cargarTicketsPaginados();
    }
  }

  // Métodos de utilidad para paginación
  getPaginationArray(): number[] {
    if (!this.paginatedData) return [];
    
    const totalPages = this.paginatedData.totalPages;
    const currentPage = this.paginatedData.currentPage;
    const delta = 2; // Número de páginas a mostrar a cada lado de la actual
    
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);
    
    // Ajustar si estamos cerca del inicio o final
    if (currentPage <= delta) {
      end = Math.min(totalPages, 2 * delta + 1);
    }
    if (currentPage + delta >= totalPages) {
      start = Math.max(1, totalPages - 2 * delta);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  verDetalleTicket(ticketId: number): void {
    // Verificar si es móvil
    const isMobile = window.innerWidth < 768; // md breakpoint de Tailwind
    
    if (isMobile) {
      // En móvil: navegar a la vista completa
      this.router.navigate(['/mesa-ayuda', ticketId, 'detalle']);
    } else {
      // En desktop: abrir drawer
      this.selectedTicketId = ticketId;
      this.showDrawer = true;
    }
  }

  cerrarDrawer(): void {
    this.showDrawer = false;
    this.selectedTicketId = null;
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

  // Método para actualizar la lista cuando se modifica un ticket en el drawer
  actualizarListaTickets(): void {
    this.cargarTickets();
  }

  crearNuevoTicket(): void {
    this.router.navigate(['/mesa-ayuda/nuevo']);
  }

  // Método para obtener clase de prioridad
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

  // Método trackBy para optimizar el renderizado
  trackByTicketId(index: number, ticket: TicketDashboardDto): number {
    return ticket.idTicket;
  }

  // Método para cambiar modo de vista
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'mosaic' ? 'table' : 'mosaic';
  }

  // Método para obtener la clase CSS de la tarjeta según el SLA
  getSLACardClass(sla: string): string {
    const baseClasses = 'bg-white border-gray-200';
    const criticoClasses = 'bg-red-50 border-red-200';
    
    return sla && sla === 'Crítico' ? criticoClasses : baseClasses;
  }

  // Método auxiliar para determinar si filtrar por resolutor
  private getIdResolutorForFilter(): string | undefined {
    if (!this.currentUser || !this.currentUser.codigoEmpleado) return undefined;
    
    // Si es solo consultor (no admin), siempre filtrar por su código de empleado
    if (this.isConsultor && !this.isAdmin) {
      return this.currentUser.codigoEmpleado;
    }
    
    // Si tiene ambos roles y está en modo "Mis tickets"
    if (this.hasBothRoles && !this.showingAllTickets) {
      return this.currentUser.codigoEmpleado;
    }
    
    // En cualquier otro caso (admin solo, o admin mostrando todos), no filtrar
    return undefined;
  }

  // Método para alternar entre vista de todos los tickets y mis tickets (solo para usuarios con ambos roles)
  toggleTicketView(): void {
    if (this.hasBothRoles) {
      this.showingAllTickets = !this.showingAllTickets;
      this.cargarTickets();
    }
  }

  // Método para obtener el texto del toggle
  getToggleButtonText(): string {
    return this.showingAllTickets ? 'Mis Tickets' : 'Todos los Tickets';
  }

  // Método para obtener el indicador de vista actual
  getCurrentViewIndicator(): string {
    if (!this.hasBothRoles) {
      if (this.isAdmin) return 'Todos los tickets';
      if (this.isConsultor) return 'Mis tickets';
    }
    return this.showingAllTickets ? 'Todos los tickets' : 'Mis tickets';
  }

  // Método para verificar si un ticket no tiene asignados resolutor actual y usuario responsable
  isTicketUnassigned(ticket: TicketDashboardDto): boolean {
    return (!ticket.idResolutorActual || ticket.idResolutorActual.toString().trim() === '') && 
           (!ticket.idUsuarioResponsable || ticket.idUsuarioResponsable.toString().trim() === '');
  }
}