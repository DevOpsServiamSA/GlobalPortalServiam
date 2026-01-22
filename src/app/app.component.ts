import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'GlobalPortalServiam';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // El ThemeService se inicializa automáticamente en su constructor
    // Esto asegura que el tema se aplique desde el inicio
  }
}
