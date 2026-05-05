import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevoTicketComponent } from './pages/nuevo-ticket/nuevo-ticket.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetalleTicketComponent } from './pages/detalle-ticket/detalle-ticket.component';
import { CrearTicketComponent } from './pages/crear-ticket/crear-ticket.component';
import { EditarTicketComponent } from './pages/editar-ticket/editar-ticket.component';
import { MantenedorCategoriasComponent } from './pages/mantenedor-categorias/mantenedor-categorias.component';
import { MantenedorPrioridadesComponent } from './pages/mantenedor-prioridades/mantenedor-prioridades.component';
import { MantenedorProyectosComponent } from './pages/mantenedor-proyectos/mantenedor-proyectos.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [RoleGuard],
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
  },
  {
    path: 'mantenedor-categorias',
    component: MantenedorCategoriasComponent,
    canActivate: [RoleGuard],
    data: { roles: ['administrador'] }
  },
  {
    path: 'mantenedor-prioridades',
    component: MantenedorPrioridadesComponent,
    canActivate: [RoleGuard],
    data: { roles: ['administrador'] }
  },
  {
    path: 'mantenedor-proyectos',
    component: MantenedorProyectosComponent,
    canActivate: [RoleGuard],
    data: { roles: ['administrador'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MesaAyudaRoutingModule { }
