import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaCxC } from '../../interfaces/cxc.interfaces';
import { ClienteDto, CodigoEmpresa } from '../../interfaces/cxc-api.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { ClientesApiService } from '../../services/clientes-api.service';
import { EstadoCuentaApiService } from '../../services/estado-cuenta-api.service';
import { EnviosApiService } from '../../services/envios-api.service';
import { CxcErrorHandlerService } from '../../services/error-handler.service';
import { EmpresaMapperService } from '../../services/empresa-mapper.service';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmarEnvioDialogComponent, ConfirmarEnvioDialogData } from '../../components/confirmar-envio-dialog/confirmar-envio-dialog.component';
import { GestionarEmailsDialogComponent, GestionarEmailsDialogData } from '../../components/gestionar-emails-dialog/gestionar-emails-dialog.component';

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
  clientes: ClienteDto[] = [];
  clientesSeleccionados: Set<string> = new Set();
  loading = false;
  loadingPdf = false;
  enviando = false;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  filtrosForm: FormGroup;
  mostrarFiltros = false;

  // Columnas actualizadas para clientes
  displayedColumns: string[] = [
    'select',
    'codigo',
    'razonSocial',
    'ruc',
    'saldoLocal',
    'saldoDolar',
    'ultimoEnvio',
    'acciones'
  ];

  monedas: { value: string; label: string }[] = [
    { value: 'S/.', label: 'Soles (S/)' },
    { value: 'USD', label: 'Dólares ($)' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private empresaContextService: EmpresaContextService,
    private clientesApiService: ClientesApiService,
    private estadoCuentaApiService: EstadoCuentaApiService,
    private enviosApiService: EnviosApiService,
    private errorHandlerService: CxcErrorHandlerService,
    private empresaMapperService: EmpresaMapperService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    // Fecha de corte obligatoria (hoy por defecto)
    this.filtrosForm = this.fb.group({
      fechaCorte: [new Date(), Validators.required],
      ruc: [''],
      codigo: [''],
      razonSocial: [''],
      activo: [true],
      soloConSaldo: [true],
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
        this.clientesSeleccionados.clear();
        if (empresa) {
          this.loadClientes();
        } else {
          this.clientes = [];
          this.totalRecords = 0;
        }
      });
  }

  loadClientes(): void {
    if (!this.empresaSeleccionada || !this.filtrosForm.valid) return;

    this.loading = true;
    const values = this.filtrosForm.value;
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(this.empresaSeleccionada.id);

    // Formatear fecha de corte a YYYY-MM-DD
    const fechaCorte = this.formatDateToISO(values.fechaCorte);

    this.clientesApiService.getClientes({
      empresa: codigoEmpresa,
      fechaCorte,
      ruc: values.ruc || undefined,
      codigo: values.codigo || undefined,
      razonSocial: values.razonSocial || undefined,
      activo: values.activo,
      soloConSaldo: values.soloConSaldo,
      moneda: values.moneda || null,
      page: this.pageIndex + 1,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.clientes = response.items;
          this.totalRecords = response.totalCount;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading clientes:', error);
          this.errorHandlerService.handleError(error);
          this.loading = false;
        }
      });
  }

  private formatDateToISO(date: Date): string {
    if (!date) return new Date().toISOString().split('T')[0];
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.clientesSeleccionados.clear();
    this.loadClientes();
  }

  limpiarFiltros(): void {
    this.filtrosForm.patchValue({
      fechaCorte: new Date(),
      ruc: '',
      codigo: '',
      razonSocial: '',
      activo: true,
      soloConSaldo: true,
      moneda: null
    });
    this.pageIndex = 0;
    this.clientesSeleccionados.clear();
    this.loadClientes();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClientes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // ============================================
  // Selección de clientes
  // ============================================

  toggleClienteSeleccion(codigo: string): void {
    if (this.clientesSeleccionados.has(codigo)) {
      this.clientesSeleccionados.delete(codigo);
    } else {
      this.clientesSeleccionados.add(codigo);
    }
  }

  isClienteSeleccionado(codigo: string): boolean {
    return this.clientesSeleccionados.has(codigo);
  }

  toggleTodosClientes(): void {
    if (this.todoSeleccionado()) {
      this.clientesSeleccionados.clear();
    } else {
      this.clientes.forEach(c => this.clientesSeleccionados.add(c.codigo));
    }
  }

  todoSeleccionado(): boolean {
    return this.clientes.length > 0 && this.clientes.every(c => this.clientesSeleccionados.has(c.codigo));
  }

  algunoSeleccionado(): boolean {
    return this.clientesSeleccionados.size > 0 && !this.todoSeleccionado();
  }

  // ============================================
  // Preview de PDF
  // ============================================

  previewPdfCliente(cliente: ClienteDto): void {
    this.previewPdf([cliente.codigo]);
  }

  previewPdfSeleccionados(): void {
    if (this.clientesSeleccionados.size === 0) {
      this.errorHandlerService.handleError({
        status: 400,
        error: { error: 'Debe seleccionar al menos un cliente' }
      } as any);
      return;
    }
    this.previewPdf(Array.from(this.clientesSeleccionados));
  }

  private previewPdf(codigosCliente: string[]): void {
    if (!this.empresaSeleccionada) return;

    this.loadingPdf = true;
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(this.empresaSeleccionada.id);
    const fechaCorte = this.formatDateToISO(this.filtrosForm.value.fechaCorte);
    const moneda = this.filtrosForm.value.moneda;
    const soloConSaldo = this.filtrosForm.value.soloConSaldo;

    this.estadoCuentaApiService.previewEstadoCuenta(codigoEmpresa, {
      fechaCorte,
      codigosCliente,
      soloConSaldo,
      moneda
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.estadoCuentaApiService.abrirPdfEnNuevaTab(blob);
          this.errorHandlerService.showSuccess('PDF generado correctamente');
          this.loadingPdf = false;
        },
        error: (error) => {
          console.error('Error generando PDF:', error);
          this.errorHandlerService.handleError(error);
          this.loadingPdf = false;
        }
      });
  }

  // ============================================
  // Envío de correos
  // ============================================

  get puedeGestionarEmails(): boolean {
    return this.authService.hasAnyRole(['administrador', 'creditos-gestor-correos']);
  }

  enviarEstadosCuentaSeleccionados(): void {
    if (this.clientesSeleccionados.size === 0 || !this.empresaSeleccionada) return;
    const codigos = Array.from(this.clientesSeleccionados);
    this.abrirConfirmacionYEnviar(codigos, 'masivo');
  }

  enviarEmailCliente(cliente: ClienteDto): void {
    if (!this.empresaSeleccionada) return;
    this.abrirConfirmacionYEnviar([cliente.codigo], 'individual', cliente.razonSocial);
  }

  private abrirConfirmacionYEnviar(
    codigosCliente: string[],
    modo: 'individual' | 'masivo',
    razonSocialCliente?: string
  ): void {
    if (!this.empresaSeleccionada) return;
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(this.empresaSeleccionada.id);
    const values = this.filtrosForm.value;
    const fechaCorte = this.formatDateToISO(values.fechaCorte);

    const dialogData: ConfirmarEnvioDialogData = {
      empresa: codigoEmpresa,
      empresaNombre: this.empresaSeleccionada.razonSocial,
      fechaCorte,
      codigosCliente,
      totalClientes: codigosCliente.length,
      moneda: values.moneda || null,
      soloConSaldo: !!values.soloConSaldo,
      modo,
      razonSocialCliente
    };

    const dialogRef = this.dialog.open(ConfirmarEnvioDialogComponent, {
      data: dialogData,
      width: '550px',
      maxWidth: '95vw',
      autoFocus: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmado => {
        if (confirmado) {
          this.ejecutarEnvio(codigoEmpresa, fechaCorte, codigosCliente, values);
        }
      });
  }

  private ejecutarEnvio(
    empresa: CodigoEmpresa,
    fechaCorte: string,
    codigosCliente: string[],
    values: any
  ): void {
    this.enviando = true;
    this.enviosApiService.enviarEstadosCuenta(empresa, {
      fechaCorte,
      ruc: null,
      codigo: null,
      razonSocial: null,
      moneda: values.moneda || null,
      soloConSaldo: !!values.soloConSaldo,
      codigosCliente
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.errorHandlerService.showSuccess(
            `${response.mensaje} (ID: ${response.ejecucionId})`
          );
          this.clientesSeleccionados.clear();
          this.enviando = false;
          this.loadClientes();
        },
        error: (error) => {
          console.error('Error enviando estados de cuenta:', error);
          this.errorHandlerService.handleError(error);
          this.enviando = false;
        }
      });
  }

  editarEmailsCliente(cliente: ClienteDto): void {
    if (!this.empresaSeleccionada) return;
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(this.empresaSeleccionada.id);

    const dialogData: GestionarEmailsDialogData = {
      empresa: codigoEmpresa,
      empresaNombre: this.empresaSeleccionada.razonSocial,
      codigoCliente: cliente.codigo,
      razonSocial: cliente.razonSocial
    };

    this.dialog.open(GestionarEmailsDialogComponent, {
      data: dialogData,
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false
    });
  }

  // ============================================
  // Helpers
  // ============================================

  getSaldoClass(saldo: number): string {
    if (saldo > 0) return 'text-red-600 font-bold';
    if (saldo < 0) return 'text-green-600 font-bold';
    return 'text-gray-600';
  }

  formatFechaUltimoEnvio(fecha: string | null): string {
    if (!fecha) return 'Nunca';
    return this.dateUtils.formatDate(new Date(fecha));
  }
}
