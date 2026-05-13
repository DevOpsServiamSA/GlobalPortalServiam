import { Component, Output, EventEmitter } from '@angular/core';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
  standalone: false
})
export class SideNavComponent {
  @Output() navigationClick = new EventEmitter<void>();
  collapsed = false;
  submenuOpen: Record<string, boolean> = {};

menuItems: MenuItem[] = [
  {
    label: 'Inicio',
    icon: 'home',
    route: '/home',
    tooltip: 'Página de inicio'
  },
  {
    label: 'Mesa de ayuda',
    icon: 'support_agent',
    tooltip: 'Mesa de ayuda',
    requiresRole: ['consultor', 'usuario', 'administrador'],
    children: [
      { label: 'Tickets', icon: 'confirmation_number', route: '/mesa-ayuda' },
      { label: 'Nuevo ticket', icon: 'add_circle', route: '/mesa-ayuda/nuevo' },
      {
        label: 'Administración',
        icon: 'settings',
        tooltip: 'Administración',
        requiresRole: 'administrador',
        children: [
          { label: 'Categorías', icon: 'category', route: '/mesa-ayuda/mantenedor-categorias' },
          { label: 'Prioridades', icon: 'flag', route: '/mesa-ayuda/mantenedor-prioridades' },
          { label: 'Proyectos', icon: 'work', route: '/mesa-ayuda/mantenedor-proyectos' },
          { label: 'Usuarios y Roles', icon: 'manage_accounts', route: '/mesa-ayuda/mantenedor-usuarios' }
        ]
      }
    ]
  },
  {
    label: 'Cuentas por Cobrar',
    icon: 'account_balance',
    route: '/cuentas-por-cobrar/detalle',
    tooltip: 'Gestión de Cuentas por Cobrar',
    requiresRole: ['administrador', 'creditos-cobranzas', 'creditos-gestor-correos']
  }
];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  toggleSubmenu(key: string) {
    this.submenuOpen[key] = !this.submenuOpen[key];
  }

  isSubmenuOpen(key: string): boolean {
    return this.submenuOpen[key] || false;
  }

  onNavigationClick() {
    this.navigationClick.emit();
  } 
}
