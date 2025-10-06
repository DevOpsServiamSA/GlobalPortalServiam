import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MatIconModule } from '@angular/material/icon';
import { TopNavComponent } from './top-nav/top-nav.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MainLayoutComponent, TopNavComponent, SideNavComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [MainLayoutComponent, TopNavComponent, SideNavComponent] 
})
export class LayoutModule { }