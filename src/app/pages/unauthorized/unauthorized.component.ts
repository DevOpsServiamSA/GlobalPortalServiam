import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div class="text-6xl text-red-500 mb-4">🚫</div>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
        <p class="text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta página.
        </p>
        <div class="space-y-3">
          <button 
            (click)="goBack()"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Regresar
          </button>
          <button 
            (click)="goHome()"
            class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ir al Inicio
          </button>
          <button 
            (click)="logout()"
            class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
  }
}