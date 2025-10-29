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
  submenuOpen: Record<number, boolean> = {};

menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    tooltip: 'Dashboard'
  },
  {
    label: 'Mesa de ayuda',
    icon: 'support_agent',
    tooltip: 'Mesa de ayuda',
    children: [
      { label: 'Tickets', icon: 'confirmation_number', route: '/mesa-ayuda' },
      { label: 'Nuevo ticket', icon: 'add_circle', route: '/mesa-ayuda/nuevo' }
    ]
  },
  {
    label: 'Administración',
    icon: 'settings',
    tooltip: 'Administración',
    children: [
      { label: 'Categorías', icon: 'category', route: '/mesa-ayuda/mantenedor-categorias' }
    ]
  }
];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  toggleSubmenu(index: number) {
    this.submenuOpen[index] = !this.submenuOpen[index];
  }

  onNavigationClick() {
    this.navigationClick.emit();
  } 
}
