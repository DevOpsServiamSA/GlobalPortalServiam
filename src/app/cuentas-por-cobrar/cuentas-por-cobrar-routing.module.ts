import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

// Components
import { CuentasPorCobrarComponent } from './cuentas-por-cobrar.component';
import { DetalleCuentaComponent } from './views/detalle-cuenta/detalle-cuenta.component';
import { HistorialEnviosComponent } from './views/historial-envios/historial-envios.component';

const routes: Routes = [
  {
    path: '',
    component: CuentasPorCobrarComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador', 'creditos-cobranzas', 'creditos-gestor-correos'] },
    children: [
      { path: '', redirectTo: 'detalle', pathMatch: 'full' },
      { path: 'detalle', component: DetalleCuentaComponent },
      { path: 'historial', component: HistorialEnviosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuentasPorCobrarRoutingModule { }
