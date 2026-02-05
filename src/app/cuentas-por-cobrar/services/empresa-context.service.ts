import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmpresaCxC } from '../interfaces/cxc.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmpresaContextService {
  private readonly STORAGE_KEY = 'cxc_empresa_seleccionada';
  private empresaSeleccionadaSubject: BehaviorSubject<EmpresaCxC | null>;
  public empresaSeleccionada$: Observable<EmpresaCxC | null>;

  constructor() {
    // Initialize with empresa from localStorage if available
    const stored = this.loadFromStorage();
    this.empresaSeleccionadaSubject = new BehaviorSubject<EmpresaCxC | null>(stored);
    this.empresaSeleccionada$ = this.empresaSeleccionadaSubject.asObservable();
  }

  /**
   * Set the selected empresa and persist to localStorage
   */
  setEmpresa(empresa: EmpresaCxC | null): void {
    this.empresaSeleccionadaSubject.next(empresa);
    if (empresa) {
      this.saveToStorage(empresa);
    } else {
      this.clearStorage();
    }
  }

  /**
   * Get the current selected empresa (sync)
   */
  getEmpresa(): EmpresaCxC | null {
    return this.empresaSeleccionadaSubject.value;
  }

  /**
   * Get the current selected empresa ID
   */
  getEmpresaId(): number | null {
    const empresa = this.getEmpresa();
    return empresa ? empresa.id : null;
  }

  /**
   * Clear the selected empresa
   */
  clearEmpresa(): void {
    this.setEmpresa(null);
  }

  /**
   * Check if an empresa is selected
   */
  hasEmpresaSeleccionada(): boolean {
    return this.getEmpresa() !== null;
  }

  /**
   * Save empresa to localStorage
   */
  private saveToStorage(empresa: EmpresaCxC): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(empresa));
    } catch (error) {
      console.error('Error saving empresa to localStorage:', error);
    }
  }

  /**
   * Load empresa from localStorage
   */
  private loadFromStorage(): EmpresaCxC | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading empresa from localStorage:', error);
    }
    return null;
  }

  /**
   * Clear localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing empresa from localStorage:', error);
    }
  }
}
