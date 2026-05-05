import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteEmailDto, CodigoEmpresa } from '../../interfaces/cxc-api.interfaces';
import { ClienteEmailsApiService } from '../../services/cliente-emails-api.service';
import { CxcErrorHandlerService } from '../../services/error-handler.service';

export interface GestionarEmailsDialogData {
  empresa: CodigoEmpresa;
  empresaNombre: string;
  codigoCliente: string;
  razonSocial: string;
}

@Component({
  selector: 'app-gestionar-emails-dialog',
  templateUrl: './gestionar-emails-dialog.component.html',
  styleUrls: ['./gestionar-emails-dialog.component.css'],
  standalone: false
})
export class GestionarEmailsDialogComponent implements OnInit, OnDestroy {
  emails: ClienteEmailDto[] = [];
  loading = false;
  saving = false;
  editingId: number | null = null;

  displayedColumns = ['principal', 'email', 'createdBy', 'acciones'];

  nuevoEmailForm: FormGroup;
  editarEmailForm: FormGroup;

  puedeEditar: boolean;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GestionarEmailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GestionarEmailsDialogData,
    private clienteEmailsApi: ClienteEmailsApiService,
    private errorHandler: CxcErrorHandlerService,
    private authService: AuthService
  ) {
    this.puedeEditar = this.authService.hasAnyRole(['administrador', 'creditos-gestor-correos']);

    this.nuevoEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255), this.sinEspaciosValidator]],
      esPrincipal: [false]
    });

    this.editarEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255), this.sinEspaciosValidator]]
    });
  }

  ngOnInit(): void {
    this.cargarEmails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sinEspaciosValidator(control: any) {
    const value: string = control.value || '';
    return value.includes(' ') ? { conEspacios: true } : null;
  }

  cargarEmails(): void {
    this.loading = true;
    this.clienteEmailsApi.getEmailsCliente(this.data.empresa, this.data.codigoCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.emails = response.emails || [];
          this.loading = false;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.loading = false;
        }
      });
  }

  crearEmail(): void {
    if (this.nuevoEmailForm.invalid || !this.puedeEditar) return;

    this.saving = true;
    const { email, esPrincipal } = this.nuevoEmailForm.value;

    this.clienteEmailsApi.crearEmail(this.data.empresa, {
      codigoCliente: this.data.codigoCliente,
      email: email.trim(),
      esPrincipal: !!esPrincipal
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess('Email agregado correctamente');
          this.nuevoEmailForm.reset({ email: '', esPrincipal: false });
          this.saving = false;
          this.cargarEmails();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.saving = false;
        }
      });
  }

  iniciarEdicion(emailItem: ClienteEmailDto): void {
    if (!this.puedeEditar) return;
    this.editingId = emailItem.id;
    this.editarEmailForm.patchValue({ email: emailItem.email });
  }

  cancelarEdicion(): void {
    this.editingId = null;
    this.editarEmailForm.reset();
  }

  guardarEdicion(emailItem: ClienteEmailDto): void {
    if (this.editarEmailForm.invalid || !this.puedeEditar) return;

    this.saving = true;
    const nuevoEmail = this.editarEmailForm.value.email.trim();

    this.clienteEmailsApi.actualizarEmail(this.data.empresa, emailItem.id, {
      id: emailItem.id,
      email: nuevoEmail
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess('Email actualizado correctamente');
          this.editingId = null;
          this.saving = false;
          this.cargarEmails();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.saving = false;
        }
      });
  }

  establecerPrincipal(emailItem: ClienteEmailDto): void {
    if (!this.puedeEditar || emailItem.esPrincipal) return;

    this.saving = true;
    this.clienteEmailsApi.establecerEmailPrincipal(this.data.empresa, emailItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess(`"${emailItem.email}" es ahora el email principal`);
          this.saving = false;
          this.cargarEmails();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.saving = false;
        }
      });
  }

  eliminarEmail(emailItem: ClienteEmailDto): void {
    if (!this.puedeEditar) return;
    const confirmado = window.confirm(`¿Eliminar el email "${emailItem.email}"?`);
    if (!confirmado) return;

    this.saving = true;
    this.clienteEmailsApi.eliminarEmail(this.data.empresa, emailItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess('Email eliminado correctamente');
          this.saving = false;
          this.cargarEmails();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.saving = false;
        }
      });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
