import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoTicketLineaService } from '../../services/estadoTicketLinea.service';
import { EstadoTicketLinea, EstadoTicketLineaHelper, EstadoTicketLineaIds } from '../../models';

/**
 * COMPONENTE TEMPORAL PARA PROBAR LA INTEGRACIÓN CON ESTADOS DE LÍNEA
 *
 * Este componente existe solo para validar que:
 * 1. El servicio retorne correctamente los estados dummy
 * 2. Los IDs numéricos se mapeen correctamente a nombres
 * 3. La integración funcione antes del endpoint real del backend
 *
 * ELIMINAR ESTE COMPONENTE una vez que se confirme que todo funciona correctamente
 */
@Component({
  selector: 'app-test-estados',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-serviam-dark">Test Estados de Línea - Data Dummy</h2>

      <!-- Loader -->
      <div *ngIf="loading" class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-serviam-primary"></div>
        <span>Cargando estados...</span>
      </div>

      <!-- Estados obtenidos del servicio -->
      <div *ngIf="!loading && estados.length > 0">
        <h3 class="text-lg font-semibold mb-3">Estados disponibles:</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let estado of estados"
               class="p-4 border rounded-lg"
               [class.border-green-500]="estado.idEstadoLinea === estadoFinalizado">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold">{{ estado.nombreEstado }}</h4>
                <p class="text-sm text-gray-600">{{ estado.descripcion }}</p>
              </div>
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                ID: {{ estado.idEstadoLinea }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Test del helper -->
      <div *ngIf="!loading" class="mt-6">
        <h3 class="text-lg font-semibold mb-3">Test Helper Functions:</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p><strong>Estado ID 1:</strong> {{ obtenerNombrePorId(1) }}</p>
          <p><strong>Estado ID 3:</strong> {{ obtenerNombrePorId(3) }}</p>
          <p><strong>Estado ID 6:</strong> {{ obtenerNombrePorId(6) }}</p>
          <p><strong>¿Es finalizado ID 6?:</strong> {{ esFinalizado(6) ? 'Sí' : 'No' }}</p>
          <p><strong>¿Es válido ID 7?:</strong> {{ esEstadoValido(7) ? 'Sí' : 'No' }}</p>
        </div>
      </div>

      <!-- Información de desarrollo -->
      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 class="font-semibold text-yellow-800">⚠️ INFORMACIÓN DE DESARROLLO</h4>
        <p class="text-sm text-yellow-700 mt-1">
          Este componente usa data dummy temporal. Cuando el endpoint
          <code>/api/estados-linea</code> esté listo en el backend,
          actualizar el método <code>obtenerEstados()</code> en el servicio.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 20px auto;
    }
  `]
})
export class TestEstadosComponent implements OnInit {
  estados: EstadoTicketLinea[] = [];
  loading = true;
  estadoFinalizado = EstadoTicketLineaIds.FINALIZADO;

  constructor(private estadoService: EstadoTicketLineaService) {}

  ngOnInit() {
    this.cargarEstados();
  }

  private cargarEstados() {
    this.loading = true;
    this.estadoService.obtenerEstados().subscribe({
      next: (estados) => {
        this.estados = estados;
        this.loading = false;
        console.log('Estados cargados:', estados);
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.loading = false;
      }
    });
  }

  // Métodos de test para el helper
  obtenerNombrePorId(id: number): string {
    return EstadoTicketLineaHelper.obtenerNombrePorId(id);
  }

  esFinalizado(id: number): boolean {
    return EstadoTicketLineaHelper.esFinalizado(id);
  }

  esEstadoValido(id: number): boolean {
    return EstadoTicketLineaHelper.esEstadoValido(id);
  }
}