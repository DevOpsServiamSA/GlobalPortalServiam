import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

// Components
import { CuentasPorCobrarComponent } from './cuentas-por-cobrar.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { DetalleCuentaComponent } from './views/detalle-cuenta/detalle-cuenta.component';
import { HistorialPagosComponent } from './views/historial-pagos/historial-pagos.component';

const routes: Routes = [
  {
    path: '',
    component: CuentasPorCobrarComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['usuario', 'consultor', 'administrador'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'detalle', component: DetalleCuentaComponent },
      { path: 'historial-pagos', component: HistorialPagosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuentasPorCobrarRoutingModule { }
