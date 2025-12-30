import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Muestra una notificación de éxito
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (default: 4000)
   */
  showSuccess(message: string, duration: number = 4000): void {
    this.show(message, 'success-snackbar', duration);
  }

  /**
   * Muestra una notificación de error
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (default: 6000)
   */
  showError(message: string, duration: number = 6000): void {
    this.show(message, 'error-snackbar', duration);
  }

  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (default: 5000)
   */
  showWarning(message: string, duration: number = 5000): void {
    this.show(message, 'warning-snackbar', duration);
  }

  /**
   * Muestra una notificación informativa
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (default: 4000)
   */
  showInfo(message: string, duration: number = 4000): void {
    this.show(message, 'info-snackbar', duration);
  }

  /**
   * Método privado para mostrar el snackbar
   */
  private show(message: string, panelClass: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    };

    this.snackBar.open(message, 'Cerrar', config);
  }
}
