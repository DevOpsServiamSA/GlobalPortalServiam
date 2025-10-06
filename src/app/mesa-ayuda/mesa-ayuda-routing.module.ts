import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevoTicketComponent } from './pages/nuevo-ticket/nuevo-ticket.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetalleTicketComponent } from './pages/detalle-ticket/detalle-ticket.component';
import { CrearTicketComponent } from './pages/crear-ticket/crear-ticket.component';
import { EditarTicketComponent } from './pages/editar-ticket/editar-ticket.component';
import { RoleGuard } from '../auth/role.guard';

const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    data: { roles: ['usuario', 'consultor', 'administrador'] }
  },
  { 
    path: 'nuevo', 
    component: CrearTicketComponent,
    canActivate: [RoleGuard],
    data: { roles: ['usuario', 'consultor', 'administrador'] }
  },
  { 
    path: ':id/detalle', 
    component: DetalleTicketComponent,
    canActivate: [RoleGuard],
    data: { roles: ['usuario', 'consultor', 'administrador'] }
  },
  { 
    path: ':id/editar', 
    component: EditarTicketComponent,
    canActivate: [RoleGuard],
    data: { roles: ['usuario', 'consultor', 'administrador'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MesaAyudaRoutingModule { }
