import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SeedService } from '../../core/services/seed.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private seed = inject(SeedService);

  message = '';
  loading = false;

  ngOnInit(): void {
    // Ensure users and logins are in LocalStorage when login page is shown (fixes SSR / timing)
    this.seed.seedLoginData();
    this.seed.seedIfEmpty();
  }

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.message = '';
    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email, password);
    this.loading = false;
    if (result.success) {
      const session = this.auth.currentSession();
      if (session) {
        this.router.navigate([`/${session.role.toLowerCase()}`]);
      }
    } else {
      this.message = result.message;
    }
  }

}
