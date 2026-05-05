import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                loadComponent: () => import('./core/pages/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'mesa-ayuda',
                loadChildren: () => import('./mesa-ayuda/mesa-ayuda.module').then(m => m.MesaAyudaModule)
            },
            {
                path: 'cuentas-por-cobrar',
                loadChildren: () => import('./cuentas-por-cobrar/cuentas-por-cobrar.module').then(m => m.CuentasPorCobrarModule)
            }
        ]
    },
    { 
        path: 'auth', 
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) 
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./core/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
