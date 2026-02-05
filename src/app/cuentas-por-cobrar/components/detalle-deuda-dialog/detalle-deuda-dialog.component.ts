import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleDeuda } from '../../interfaces/cxc.interfaces';
import { CurrencyUtils } from '../../utils/currency.utils';
import { DateFormatUtils } from '../../utils/date-format.utils';

@Component({
  selector: 'app-detalle-deuda-dialog',
  templateUrl: './detalle-deuda-dialog.component.html',
  styleUrls: ['./detalle-deuda-dialog.component.css'],
  standalone: false
})
export class DetalleDeudaDialogComponent {
  currencyUtils = CurrencyUtils;
  dateUtils = DateFormatUtils;

  constructor(
    public dialogRef: MatDialogRef<DetalleDeudaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { deuda: DetalleDeuda }
  ) {}

  get deuda(): DetalleDeuda {
    return this.data.deuda;
  }

  get estadoClass(): string {
    switch (this.deuda.estado) {
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

  get estadoLabel(): string {
    switch (this.deuda.estado) {
      case 'VENCIDO':
        return 'Vencido';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'PAGADO':
        return 'Pagado';
      case 'PARCIALMENTE_PAGADO':
        return 'Parcialmente Pagado';
      default:
        return this.deuda.estado;
    }
  }

  get tipoDocumentoLabel(): string {
    switch (this.deuda.tipoDocumento) {
      case 'FACTURA':
        return 'Factura';
      case 'NOTA_DEBITO':
        return 'Nota de Débito';
      case 'NOTA_CREDITO':
        return 'Nota de Crédito';
      default:
        return this.deuda.tipoDocumento;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
