import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeedService } from './core/services/seed.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private seed = inject(SeedService);
  private theme = inject(ThemeService);

  constructor() {
    this.seed.seedIfEmpty();
  }
}
