import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleUtilsService {
  
  /**
   * Obtiene las clases CSS para el badge de prioridad
   * @param prioridad - La prioridad del ticket
   * @returns String con las clases CSS
   */
  static getPrioridadClass(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
      case 'high':
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Obtiene las clases CSS para el badge de estado
   * @param estado - El estado del ticket
   * @returns String con las clases CSS
   */
  static getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'ingresado':
      case 'nuevo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'asignado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'desarrollo':
      case 'en proceso':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'escalado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pruebas':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'finalizado':
      case 'cerrado':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Obtiene la clase CSS para íconos basada en la prioridad
   * @param prioridad - La prioridad del ticket
   * @returns String con la clase CSS del ícono
   */
  static getPrioridadIconClass(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
      case 'high':
      case 'critica':
        return 'text-red-500';
      case 'media':
      case 'medium':
        return 'text-yellow-500';
      case 'baja':
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Obtiene la clase CSS para íconos basada en el estado
   * @param estado - El estado del ticket
   * @returns String con la clase CSS del ícono
   */
  static getEstadoIconClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'ingresado':
      case 'nuevo':
        return 'text-blue-500';
      case 'asignado':
        return 'text-indigo-500';
      case 'desarrollo':
      case 'en proceso':
        return 'text-orange-500';
      case 'escalado':
        return 'text-purple-500';
      case 'pruebas':
        return 'text-cyan-500';
      case 'finalizado':
      case 'cerrado':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
}