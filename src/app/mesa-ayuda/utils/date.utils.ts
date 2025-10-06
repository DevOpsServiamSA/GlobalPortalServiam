import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  
  /**
   * Formatea una fecha para mostrar en formato local peruano
   * @param fecha - String con la fecha en formato ISO
   * @returns Fecha formateada como dd/mm/yyyy hh:mm
   */
  static formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', fecha, error);
      return '-';
    }
  }

  /**
   * Formatea una fecha para mostrar solo la fecha (sin hora)
   * @param fecha - String con la fecha en formato ISO
   * @returns Fecha formateada como dd/mm/yyyy
   */
  static formatearFechaSoloFecha(fecha: string): string {
    if (!fecha) return '-';
    
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', fecha, error);
      return '-';
    }
  }

  /**
   * Formatea una fecha para mostrar en formato completo
   * @param fecha - String con la fecha en formato ISO
   * @returns Fecha formateada como "Lunes, 15 de enero de 2024 a las 14:30"
   */
  static formatearFechaCompleta(fecha: string): string {
    if (!fecha) return '-';
    
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', fecha, error);
      return '-';
    }
  }

  /**
   * Calcula el tiempo transcurrido desde una fecha hasta ahora
   * @param fecha - String con la fecha en formato ISO
   * @returns String con el tiempo transcurrido (ej: "hace 2 horas")
   */
  static tiempoTranscurrido(fecha: string): string {
    if (!fecha) return '-';
    
    try {
      const fechaCreacion = new Date(fecha);
      const ahora = new Date();
      const diferencia = ahora.getTime() - fechaCreacion.getTime();
      
      const minutos = Math.floor(diferencia / (1000 * 60));
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      
      if (dias > 0) {
        return `hace ${dias} día${dias > 1 ? 's' : ''}`;
      } else if (horas > 0) {
        return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
      } else if (minutos > 0) {
        return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
      } else {
        return 'hace un momento';
      }
    } catch (error) {
      console.warn('Error al calcular tiempo transcurrido:', fecha, error);
      return '-';
    }
  }

  /**
   * Verifica si una fecha está vencida (pasada)
   * @param fecha - String con la fecha en formato ISO
   * @returns Boolean indicando si la fecha está vencida
   */
  static estaVencida(fecha: string): boolean {
    if (!fecha) return false;
    
    try {
      const fechaVencimiento = new Date(fecha);
      const ahora = new Date();
      return fechaVencimiento.getTime() < ahora.getTime();
    } catch (error) {
      console.warn('Error al verificar vencimiento:', fecha, error);
      return false;
    }
  }
}