import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MatIconModule } from '@angular/material/icon';
import { TopNavComponent } from './top-nav/top-nav.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HasRoleDirective } from '../auth/directives/has-role.directive';

@NgModule({
  declarations: [MainLayoutComponent, TopNavComponent, SideNavComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    HasRoleDirective
  ],
  exports: [MainLayoutComponent, TopNavComponent, SideNavComponent]
})
export class LayoutModule { }