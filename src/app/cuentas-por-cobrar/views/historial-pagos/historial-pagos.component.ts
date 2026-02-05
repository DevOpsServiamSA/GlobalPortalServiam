import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpresaCxC, HistorialPago, FiltrosHistorialPagos } from '../../interfaces/cxc.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { CuentasPorCobrarService } from '../../services/cuentas-por-cobrar.service';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';

@Component({
  selector: 'app-historial-pagos',
  templateUrl: './historial-pagos.component.html',
  styleUrls: ['./historial-pagos.component.css'],
  standalone: false
})
export class HistorialPagosComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  empresaSeleccionada: EmpresaCxC | null = null;
  pagos: HistorialPago[] = [];
  loading = false;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  totalPagado = 0;

  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  filtrosForm: FormGroup;
  mostrarFiltros = false;

  displayedColumns: string[] = [
    'fechaPago',
    'documentoRelacionado',
    'montoPagado',
    'metodoPago',
    'numeroOperacion',
    'observaciones'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private empresaContextService: EmpresaContextService,
    private cuentasPorCobrarService: CuentasPorCobrarService
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      fechaDesde: [null],
      fechaHasta: [null]
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
          this.loadPagos();
          this.loadTotalPagado();
        } else {
          this.pagos = [];
          this.totalRecords = 0;
          this.totalPagado = 0;
        }
      });
  }

  loadPagos(): void {
    if (!this.empresaSeleccionada) return;

    this.loading = true;
    const filtros = this.getFiltros();

    this.cuentasPorCobrarService.getHistorialPagos(
      this.empresaSeleccionada.id,
      filtros,
      this.pageIndex + 1,
      this.pageSize
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pagos = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading pagos:', error);
          this.loading = false;
        }
      });
  }

  private loadTotalPagado(): void {
    if (!this.empresaSeleccionada) return;

    const filtros = this.getFiltros();
    this.cuentasPorCobrarService.getTotalPagado(
      this.empresaSeleccionada.id,
      filtros?.fechaDesde,
      filtros?.fechaHasta
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (total) => {
          this.totalPagado = total;
        },
        error: (error) => {
          console.error('Error loading total pagado:', error);
        }
      });
  }

  private getFiltros(): FiltrosHistorialPagos | undefined {
    const values = this.filtrosForm.value;
    const filtros: FiltrosHistorialPagos = {};

    if (values.busqueda && values.busqueda.trim()) {
      filtros.busqueda = values.busqueda.trim();
    }
    if (values.fechaDesde) {
      filtros.fechaDesde = values.fechaDesde;
    }
    if (values.fechaHasta) {
      filtros.fechaHasta = values.fechaHasta;
    }

    return Object.keys(filtros).length > 0 ? filtros : undefined;
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.loadPagos();
    this.loadTotalPagado();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.pageIndex = 0;
    this.loadPagos();
    this.loadTotalPagado();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPagos();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }
}
