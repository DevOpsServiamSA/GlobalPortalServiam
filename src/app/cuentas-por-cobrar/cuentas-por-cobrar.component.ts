import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
export class CuentasPorCobrarComponent {
  navLinks: NavLink[] = [
    {
      label: 'Dashboard',
      route: '/cuentas-por-cobrar/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Detalle de Cuenta',
      route: '/cuentas-por-cobrar/detalle',
      icon: 'receipt_long'
    },
    {
      label: 'Historial de Pagos',
      route: '/cuentas-por-cobrar/historial-pagos',
      icon: 'payments'
    }
  ];

  constructor(private router: Router) {}

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
