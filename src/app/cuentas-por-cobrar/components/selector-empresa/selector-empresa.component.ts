import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmpresaCxC } from '../../interfaces/cxc.interfaces';
import { EmpresaContextService } from '../../services/empresa-context.service';
import { EmpresasCxcService } from '../../services/empresas-cxc.service';

@Component({
  selector: 'app-selector-empresa',
  templateUrl: './selector-empresa.component.html',
  styleUrls: ['./selector-empresa.component.css'],
  standalone: false
})
export class SelectorEmpresaComponent implements OnInit, OnDestroy {
  empresas: EmpresaCxC[] = [];
  empresaSeleccionada: EmpresaCxC | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private empresaContextService: EmpresaContextService,
    private empresasCxcService: EmpresasCxcService
  ) {}

  ngOnInit(): void {
    this.loadEmpresas();
    this.subscribeToEmpresaSeleccionada();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEmpresas(): void {
    this.loading = true;
    this.empresasCxcService.getEmpresas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (empresas) => {
          this.empresas = empresas;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading empresas:', error);
          this.loading = false;
        }
      });
  }

  private subscribeToEmpresaSeleccionada(): void {
    this.empresaContextService.empresaSeleccionada$
      .pipe(takeUntil(this.destroy$))
      .subscribe(empresa => {
        this.empresaSeleccionada = empresa;
      });
  }

  onEmpresaChange(empresa: EmpresaCxC | null): void {
    this.empresaContextService.setEmpresa(empresa);
  }

  compareEmpresas(e1: EmpresaCxC, e2: EmpresaCxC): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }
}
