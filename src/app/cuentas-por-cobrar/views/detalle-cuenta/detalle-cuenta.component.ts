import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpresaCxC, DetalleDeuda, FiltrosDetalleDeuda, TipoDocumento, EstadoDocumento, Moneda } from '../../interfaces/cxc.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { CuentasPorCobrarService } from '../../services/cuentas-por-cobrar.service';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';
import { DetalleDeudaDialogComponent } from '../../components/detalle-deuda-dialog/detalle-deuda-dialog.component';

@Component({
  selector: 'app-detalle-cuenta',
  templateUrl: './detalle-cuenta.component.html',
  styleUrls: ['./detalle-cuenta.component.css'],
  standalone: false
})
export class DetalleCuentaComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  empresaSeleccionada: EmpresaCxC | null = null;
  detalles: DetalleDeuda[] = [];
  loading = false;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  filtrosForm: FormGroup;
  mostrarFiltros = false;

  displayedColumns: string[] = [
    'numeroDocumento',
    'tipoDocumento',
    'fechaEmision',
    'fechaVencimiento',
    'montoOriginal',
    'montoPendiente',
    'estado',
    'acciones'
  ];

  tiposDocumento: { value: TipoDocumento; label: string }[] = [
    { value: 'FACTURA', label: 'Factura' },
    { value: 'NOTA_DEBITO', label: 'Nota de Débito' },
    { value: 'NOTA_CREDITO', label: 'Nota de Crédito' }
  ];

  estados: { value: EstadoDocumento; label: string }[] = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'VENCIDO', label: 'Vencido' },
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'PARCIALMENTE_PAGADO', label: 'Parcialmente Pagado' }
  ];

  monedas: { value: Moneda; label: string }[] = [
    { value: 'PEN', label: 'Soles (S/)' },
    { value: 'USD', label: 'Dólares ($)' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private empresaContextService: EmpresaContextService,
    private cuentasPorCobrarService: CuentasPorCobrarService,
    private dialog: MatDialog
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [null],
      fechaHasta: [null],
      tipoDocumento: [null],
      estado: [null],
      moneda: [null]
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
          this.loadDetalles();
        } else {
          this.detalles = [];
          this.totalRecords = 0;
        }
      });
  }

  loadDetalles(): void {
    if (!this.empresaSeleccionada) return;

    this.loading = true;
    const filtros = this.getFiltros();

    this.cuentasPorCobrarService.getDetallesDeuda(
      this.empresaSeleccionada.id,
      filtros,
      this.pageIndex + 1,
      this.pageSize
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.detalles = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading detalles:', error);
          this.loading = false;
        }
      });
  }

  private getFiltros(): FiltrosDetalleDeuda | undefined {
    const values = this.filtrosForm.value;
    const filtros: FiltrosDetalleDeuda = {};

    if (values.fechaDesde) {
      filtros.fechaDesde = values.fechaDesde;
    }
    if (values.fechaHasta) {
      filtros.fechaHasta = values.fechaHasta;
    }
    if (values.tipoDocumento) {
      filtros.tipoDocumento = values.tipoDocumento;
    }
    if (values.estado) {
      filtros.estado = values.estado;
    }
    if (values.moneda) {
      filtros.moneda = values.moneda;
    }

    return Object.keys(filtros).length > 0 ? filtros : undefined;
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.loadDetalles();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.pageIndex = 0;
    this.loadDetalles();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDetalles();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'VENCIDO':
        return 'bg-red-100 text-red-700';
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-700';
      case 'PAGADO':
        return 'bg-green-100 text-green-700';
      case 'PARCIALMENTE_PAGADO':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'VENCIDO':
        return 'Vencido';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'PAGADO':
        return 'Pagado';
      case 'PARCIALMENTE_PAGADO':
        return 'Parcial';
      default:
        return estado;
    }
  }

  getTipoDocumentoLabel(tipo: string): string {
    switch (tipo) {
      case 'FACTURA':
        return 'Factura';
      case 'NOTA_DEBITO':
        return 'N. Débito';
      case 'NOTA_CREDITO':
        return 'N. Crédito';
      default:
        return tipo;
    }
  }

  openDetalleDialog(deuda: DetalleDeuda): void {
    this.dialog.open(DetalleDeudaDialogComponent, {
      width: '600px',
      data: { deuda }
    });
  }
}
