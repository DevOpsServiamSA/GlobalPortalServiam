import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnvioDetalleDto, HistorialEnvioDto } from '../../interfaces/cxc-api.interfaces';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';

export interface DetalleEnvioDialogData {
  envio: HistorialEnvioDto;
}

type FiltroTab = 'todos' | 'enviados' | 'errores' | 'omitidos';

@Component({
  selector: 'app-detalle-envio-dialog',
  templateUrl: './detalle-envio-dialog.component.html',
  styleUrls: ['./detalle-envio-dialog.component.css'],
  standalone: false
})
export class DetalleEnvioDialogComponent implements OnInit {
  envio: HistorialEnvioDto;
  detallesFiltrados: EnvioDetalleDto[] = [];
  filtroActivo: FiltroTab = 'todos';

  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  displayedColumns = [
    'cliente',
    'ruc',
    'emailDestino',
    'estado',
    'saldos',
    'fechaEnvio',
    'intentos'
  ];

  constructor(
    public dialogRef: MatDialogRef<DetalleEnvioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleEnvioDialogData
  ) {
    this.envio = data.envio;
  }

  ngOnInit(): void {
    this.aplicarFiltro('todos');
  }

  aplicarFiltro(filtro: FiltroTab): void {
    this.filtroActivo = filtro;
    const detalles = this.envio.detalles || [];
    switch (filtro) {
      case 'enviados':
        this.detallesFiltrados = detalles.filter(d => d.estado === 'Enviado' || d.estado === 'Generado');
        break;
      case 'errores':
        this.detallesFiltrados = detalles.filter(d => d.estado === 'ErrorEnvio' || d.estado === 'ErrorGeneracion');
        break;
      case 'omitidos':
        this.detallesFiltrados = detalles.filter(d => d.estado === 'Omitido');
        break;
      default:
        this.detallesFiltrados = detalles;
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Enviado':
      case 'Generado':
        return 'bg-green-100 text-green-700';
      case 'ErrorEnvio':
      case 'ErrorGeneracion':
        return 'bg-red-100 text-red-700';
      case 'Omitido':
        return 'bg-gray-100 text-gray-600';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return this.dateUtils.formatDate(new Date(date));
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    const d = new Date(date);
    return `${this.dateUtils.formatDate(d)} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
