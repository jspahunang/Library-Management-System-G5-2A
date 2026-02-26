import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { getNavItemsForRole } from '../../core/constants/nav-config';
import type { NavItem } from '../../core/constants/nav-config';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  sidebarOpen = signal(true);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  theme = inject(ThemeService);

  session = computed(() => this.auth.currentSession());

  safeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  navItems = computed(() => {
    const s = this.session();
    return s ? getNavItemsForRole(s.role) : [];
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
