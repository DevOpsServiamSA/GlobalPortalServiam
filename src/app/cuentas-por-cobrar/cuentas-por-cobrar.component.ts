import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmpresaContextService } from './services/empresa-context.service';
import { EmpresaCxC } from './interfaces/cxc.interfaces';

interface NavLink {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css'],
  standalone: false
})
export class CuentasPorCobrarComponent implements OnInit, OnDestroy {
  navLinks: NavLink[] = [
    {
      label: 'Estado de cuenta',
      route: 'detalle',
      icon: 'receipt_long'
    },
    {
      label: 'Historial de envíos',
      route: 'historial',
      icon: 'history'
    }
  ];

  empresaSeleccionada: EmpresaCxC | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private empresaContextService: EmpresaContextService
  ) {}

  ngOnInit(): void {
    this.empresaContextService.empresaSeleccionada$
      .pipe(takeUntil(this.destroy$))
      .subscribe(empresa => {
        this.empresaSeleccionada = empresa;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.endsWith(route);
  }
}
