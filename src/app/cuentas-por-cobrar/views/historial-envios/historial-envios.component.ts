import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpresaCxC } from '../../interfaces/cxc.interfaces';
import { HistorialEnvioDto } from '../../interfaces/cxc-api.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { EnviosApiService } from '../../services/envios-api.service';
import { EmpresaMapperService } from '../../services/empresa-mapper.service';
import { CxcErrorHandlerService } from '../../services/error-handler.service';
import { DateFormatUtils } from '../../utils/date-format.utils';
import { DetalleEnvioDialogComponent } from '../../components/detalle-envio-dialog/detalle-envio-dialog.component';

@Component({
  selector: 'app-historial-envios',
  templateUrl: './historial-envios.component.html',
  styleUrls: ['./historial-envios.component.css'],
  standalone: false
})
export class HistorialEnviosComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  empresaSeleccionada: EmpresaCxC | null = null;
  envios: HistorialEnvioDto[] = [];
  loading = false;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  dateUtils = DateFormatUtils;

  filtrosForm: FormGroup;
  mostrarFiltros = false;

  displayedColumns: string[] = [
    'fechaInicio',
    'usuario',
    'fechaCorte',
    'totalClientes',
    'totalEnviados',
    'totalErrores',
    'estado',
    'acciones'
  ];

  estados: { value: string; label: string }[] = [
    { value: 'Completado', label: 'Completado' },
    { value: 'EnProceso', label: 'En Proceso' },
    { value: 'Fallido', label: 'Fallido' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private empresaContextService: EmpresaContextService,
    private enviosApiService: EnviosApiService,
    private empresaMapperService: EmpresaMapperService,
    private errorHandlerService: CxcErrorHandlerService,
    private dialog: MatDialog
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [null],
      fechaHasta: [null],
      usuario: [''],
      estado: [null],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.subscribeToEmpresaSeleccionada();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToEmpresaSeleccionada(): void {
    this.empresaContextService.empresaSeleccionada$
      .pipe(takeUntil(this.destroy$))
      .subscribe(empresa => {
        this.empresaSeleccionada = empresa;
        this.pageIndex = 0;
        if (empresa) {
          this.loadEnvios();
        } else {
          this.envios = [];
          this.totalRecords = 0;
        }
      });
  }

  loadEnvios(): void {
    if (!this.empresaSeleccionada) return;

    this.loading = true;
    const values = this.filtrosForm.value;
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(this.empresaSeleccionada.id);

    this.enviosApiService.getHistorialEnvios({
      empresa: codigoEmpresa,
      fechaDesde: values.fechaDesde ? this.formatDateToISO(values.fechaDesde) : undefined,
      fechaHasta: values.fechaHasta ? this.formatDateToISO(values.fechaHasta) : undefined,
      usuario: values.usuario || undefined,
      estado: values.estado || undefined,
      searchTerm: values.searchTerm || undefined,
      page: this.pageIndex + 1,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.envios = response.items;
          this.totalRecords = response.totalCount;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading envios:', error);
          this.errorHandlerService.handleError(error);
          this.loading = false;
        }
      });
  }

  private formatDateToISO(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.loadEnvios();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.pageIndex = 0;
    this.loadEnvios();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEnvios();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-700';
      case 'EnProceso':
        return 'bg-blue-100 text-blue-700';
      case 'Fallido':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'Completado':
        return 'Completado';
      case 'EnProceso':
        return 'En Proceso';
      case 'Fallido':
        return 'Fallido';
      default:
        return estado;
    }
  }

  verDetalles(envio: HistorialEnvioDto): void {
    this.dialog.open(DetalleEnvioDialogComponent, {
      data: { envio },
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false
    });
  }

  formatDate(dateString: string): string {
    return this.dateUtils.formatDate(new Date(dateString));
  }

  formatRelativeTime(dateString: string): string {
    return this.dateUtils.formatRelativeTime(new Date(dateString));
  }
}
