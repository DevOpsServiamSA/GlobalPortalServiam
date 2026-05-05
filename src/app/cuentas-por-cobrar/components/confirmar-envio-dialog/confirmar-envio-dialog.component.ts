import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodigoEmpresa } from '../../interfaces/cxc-api.interfaces';

export interface ConfirmarEnvioDialogData {
  empresa: CodigoEmpresa;
  empresaNombre: string;
  fechaCorte: string;
  codigosCliente: string[];
  totalClientes: number;
  moneda: string | null;
  soloConSaldo: boolean;
  modo: 'individual' | 'masivo';
  razonSocialCliente?: string;
}

@Component({
  selector: 'app-confirmar-envio-dialog',
  templateUrl: './confirmar-envio-dialog.component.html',
  styleUrls: ['./confirmar-envio-dialog.component.css'],
  standalone: false
})
export class ConfirmarEnvioDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmarEnvioDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmarEnvioDialogData
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  getMonedaLabel(): string {
    if (!this.data.moneda) return 'Todas las monedas';
    if (this.data.moneda === 'S/.') return 'Soles (S/)';
    if (this.data.moneda === 'USD') return 'Dólares (USD)';
    return this.data.moneda;
  }
}
