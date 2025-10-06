import { Component } from '@angular/core';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    standalone: false
})
export class MainLayoutComponent {
    isMobileSidenavOpen = false;

    onToggleSidenav() {
        this.isMobileSidenavOpen = !this.isMobileSidenavOpen;
        console.log('Sidenav toggled (mobile):', this.isMobileSidenavOpen);
    }

    closeMobileSidenav() {
        this.isMobileSidenavOpen = false;
    }
}
