import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MesaAyudaRoutingModule } from './mesa-ayuda-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NuevoTicketComponent } from './pages/nuevo-ticket/nuevo-ticket.component';
import { DetalleTicketComponent } from './pages/detalle-ticket/detalle-ticket.component';
import { EditarTicketComponent } from './pages/editar-ticket/editar-ticket.component';
import { MantenedorCategoriasComponent } from './pages/mantenedor-categorias/mantenedor-categorias.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DetalleDrawerComponent } from './components/detalle-drawer/detalle-drawer.component';
import { RouterModule } from '@angular/router';
import { CrearTicketComponent } from './pages/crear-ticket/crear-ticket.component';
import { TicketService } from './services/ticket.service';
import { EmpresaService } from './services/empresa.service';
import { CategoriaService } from './services/categoria.service';
import { StyleUtilsService, DateUtilsService } from './utils';


import { MantenedorPrioridadesComponent } from './pages/mantenedor-prioridades/mantenedor-prioridades.component';
import { MantenedorProyectosComponent } from './pages/mantenedor-proyectos/mantenedor-proyectos.component';

@NgModule({
  declarations: [
    DashboardComponent,
    NuevoTicketComponent,
    DetalleTicketComponent,
    EditarTicketComponent,
    DetalleDrawerComponent,
    CrearTicketComponent,
    MantenedorCategoriasComponent,
    MantenedorPrioridadesComponent,
    MantenedorProyectosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MesaAyudaRoutingModule
  ],
  exports: [
    DashboardComponent,
    DetalleTicketComponent,
    DetalleDrawerComponent
  ],
  providers: [
    TicketService,
    EmpresaService,
    CategoriaService,
    StyleUtilsService,
    DateUtilsService
  ]
})
export class MesaAyudaModule { }