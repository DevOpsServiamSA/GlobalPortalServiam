import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserInfo } from '../../models/auth.models';
import { HasRoleDirective } from '../../../auth/directives/has-role.directive';

interface ModuloHome {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  roles: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, HasRoleDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentUser$: Observable<UserInfo | null>;

  modulos: ModuloHome[] = [
    {
      titulo: 'Mesa de Ayuda',
      descripcion: 'Sistema de tickets y soporte interno',
      icono: 'support_agent',
      ruta: '/mesa-ayuda',
      roles: ['usuario', 'consultor', 'administrador']
    },
    {
      titulo: 'Cuentas por Cobrar',
      descripcion: 'Gestión de cuentas, envíos y cobranzas',
      icono: 'account_balance',
      ruta: '/cuentas-por-cobrar/detalle',
      roles: ['administrador', 'creditos-cobranzas', 'creditos-gestor-correos']
    }
  ];

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}
