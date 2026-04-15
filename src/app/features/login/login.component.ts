import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SeedService } from '../../core/services/seed.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule, MessageModule],
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

  async ngOnInit(): Promise<void> {
    // Seed initial Firestore data + Create Mock Auth Accounts
    await this.seed.seedIfEmpty();
  }

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.message = '';
    const { email, password } = this.form.getRawValue();
    
    const result = await this.auth.login(email, password);
    this.loading = false;
    
    if (result.success) {
      // The session may take a small moment to arrive from the auth state change listener.
      // Easiest is to wait briefly or let the auth guard handle routing if configured. 
      // For now, we'll wait a tick.
      setTimeout(() => {
         const session = this.auth.currentSession();
         if (session) {
           this.router.navigate([`/${session.role.toLowerCase()}`]);
         } else {
           // Fallback if session isn't loaded instantly
           this.router.navigate(['/']);
         }
      }, 500);
      
    } else {
      this.message = result.message;
    }
  }
}
