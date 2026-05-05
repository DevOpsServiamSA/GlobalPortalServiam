import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CuentasPorCobrarRoutingModule } from './cuentas-por-cobrar-routing.module';

// Components
import { CuentasPorCobrarComponent } from './cuentas-por-cobrar.component';
import { SelectorEmpresaComponent } from './components/selector-empresa/selector-empresa.component';
import { EstadoCuentaCardComponent } from './components/estado-cuenta-card/estado-cuenta-card.component';
import { DetalleDeudaDialogComponent } from './components/detalle-deuda-dialog/detalle-deuda-dialog.component';
import { ConfirmarEnvioDialogComponent } from './components/confirmar-envio-dialog/confirmar-envio-dialog.component';
import { GestionarEmailsDialogComponent } from './components/gestionar-emails-dialog/gestionar-emails-dialog.component';
import { DetalleEnvioDialogComponent } from './components/detalle-envio-dialog/detalle-envio-dialog.component';

// Views
import { DetalleCuentaComponent } from './views/detalle-cuenta/detalle-cuenta.component';
import { HistorialEnviosComponent } from './views/historial-envios/historial-envios.component';

@NgModule({
  declarations: [
    CuentasPorCobrarComponent,
    SelectorEmpresaComponent,
    EstadoCuentaCardComponent,
    DetalleDeudaDialogComponent,
    ConfirmarEnvioDialogComponent,
    GestionarEmailsDialogComponent,
    DetalleEnvioDialogComponent,
    DetalleCuentaComponent,
    HistorialEnviosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CuentasPorCobrarRoutingModule,
    // Material Modules
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatCheckboxModule
  ]
})
export class CuentasPorCobrarModule { }
