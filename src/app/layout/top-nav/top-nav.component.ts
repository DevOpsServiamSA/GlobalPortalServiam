import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth.models';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  standalone: false
})
export class TopNavComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  
  currentUser: UserInfo | null = null;
  showUserMenu = false;
  isDarkMode = false;
  private userSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    this.themeSubscription = this.themeService.theme$.subscribe(
      theme => this.isDarkMode = theme === 'dark'
    );
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.closeUserMenu();
  }

  onLogout(): void {
    this.authService.logout();
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  getRoleDisplayName(roles: string[]): string {
    if (roles.includes('administrador')) return 'Administrador';
    if (roles.includes('consultor')) return 'Consultor';
    if (roles.includes('usuario')) return 'Usuario';
    return 'Usuario';
  }
}
