import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeedService } from '../../core/services/seed.service';

interface DemoAccount {
  role: string;
  email: string;
}

@Component({
  selector: 'app-demo-credentials',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './demo-credentials.component.html',
  styleUrl: './demo-credentials.component.scss',
})
export class DemoCredentialsComponent {
  private seed = inject(SeedService);

  demoDataLoaded = false;

  readonly accounts: DemoAccount[] = [
    { role: 'Admin', email: 'admin@lms.edu' },
    { role: 'Librarian', email: 'librarian@lms.edu' },
    { role: 'Student', email: 'student@lms.edu' },
    { role: 'Teacher', email: 'teacher@lms.edu' },
  ];

  readonly password = 'password123';

  loadDemoData(): void {
    this.seed.seedLoginData();
    this.seed.seedIfEmpty();
    this.demoDataLoaded = true;
  }
}
