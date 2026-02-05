import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { EmpresaCxC, ResumenCuenta, DetalleDeuda } from '../../interfaces/cxc.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { CuentasPorCobrarService } from '../../services/cuentas-por-cobrar.service';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';
import { MatDialog } from '@angular/material/dialog';
import { DetalleDeudaDialogComponent } from '../../components/detalle-deuda-dialog/detalle-deuda-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  empresaSeleccionada: EmpresaCxC | null = null;
  resumen: ResumenCuenta | null = null;
  documentosRecientes: DetalleDeuda[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  displayedColumns: string[] = ['numeroDocumento', 'tipoDocumento', 'fechaVencimiento', 'monto', 'estado', 'acciones'];

  constructor(
    private empresaContextService: EmpresaContextService,
    private cuentasPorCobrarService: CuentasPorCobrarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscribeToEmpresaSeleccionada();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToEmpresaSeleccionada(): void {
    this.empresaContextService.empresaSeleccionada$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(empresa => {
          this.empresaSeleccionada = empresa;
          this.resumen = null;
          this.documentosRecientes = [];

          if (empresa) {
            this.loading = true;
            return this.cuentasPorCobrarService.getResumenCuenta(empresa.id);
          }
          return [];
        })
      )
      .subscribe({
        next: (resumen: any) => {
          if (resumen) {
            this.resumen = resumen;
            this.loadDocumentosRecientes();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading resumen:', error);
          this.loading = false;
        }
      });
  }

  private loadDocumentosRecientes(): void {
    if (!this.empresaSeleccionada) return;

    this.cuentasPorCobrarService.getDetallesDeuda(this.empresaSeleccionada.id, undefined, 1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.documentosRecientes = response.data.slice(0, 10);
        },
        error: (error) => {
          console.error('Error loading documentos recientes:', error);
        }
      });
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
