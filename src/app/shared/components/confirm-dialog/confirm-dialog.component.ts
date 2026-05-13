import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoSi?: string;
  textoNo?: string;
  pedirMotivo?: boolean;
  motivoLabel?: string;
  motivoMaxLength?: number;
  motivoRequerido?: boolean;
}

export interface ConfirmDialogResult {
  confirmado: boolean;
  motivo?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  standalone: false
})
export class ConfirmDialogComponent {
  motivoCtrl: FormControl<string>;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    const validators = [];
    if (data.motivoRequerido) {
      validators.push(Validators.required);
    }
    if (data.motivoMaxLength) {
      validators.push(Validators.maxLength(data.motivoMaxLength));
    }
    this.motivoCtrl = new FormControl<string>('', {
      nonNullable: true,
      validators
    });
  }

  get textoSi(): string {
    return this.data.textoSi || 'Sí';
  }

  get textoNo(): string {
    return this.data.textoNo || 'No';
  }

  get motivoLabel(): string {
    return this.data.motivoLabel || 'Motivo (opcional)';
  }

  confirmar(): void {
    if (this.data.pedirMotivo && this.motivoCtrl.invalid) {
      this.motivoCtrl.markAsTouched();
      return;
    }
    this.dialogRef.close({
      confirmado: true,
      motivo: this.data.pedirMotivo ? (this.motivoCtrl.value?.trim() || undefined) : undefined
    });
  }

  cancelar(): void {
    this.dialogRef.close({ confirmado: false });
  }
}
