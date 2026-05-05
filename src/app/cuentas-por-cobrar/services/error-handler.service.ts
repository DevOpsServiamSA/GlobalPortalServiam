import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CxcErrorHandlerService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Maneja errores HTTP de forma centralizada
   */
  handleError(error: HttpErrorResponse): void {
    let mensaje = 'Ha ocurrido un error. Por favor, intente nuevamente.';

    if (error.status === 0) {
      // Error de red o CORS
      mensaje = 'No se pudo conectar con el servidor. Verifique su conexión.';
    } else if (error.status === 400) {
      // Bad Request - mostrar errores de validación
      if (error.error?.error) {
        mensaje = error.error.error;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        mensaje = error.error.errors.join(', ');
      }
    } else if (error.status === 401) {
      mensaje = 'No autorizado. Por favor, inicie sesión nuevamente.';
    } else if (error.status === 403) {
      mensaje = 'No tiene permisos para realizar esta acción.';
    } else if (error.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (error.status >= 500) {
      mensaje = 'Error interno del servidor. Contacte al administrador.';
    }

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
