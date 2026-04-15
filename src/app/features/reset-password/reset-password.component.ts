import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../core/services/login.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private loginService = inject(LoginService);

  email = '';
  message = '';
  success = false;
  loading = false;

  async onSubmit(): Promise<void> {
    const e = this.email.trim();
    if (!e) {
      this.message = 'Please enter your email.';
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!emailValid) {
      this.message = 'Please enter a valid email address.';
      return;
    }
    this.loading = true;
    this.message = '';
    
    const result = await this.loginService.requestPasswordReset(e);
    this.loading = false;
    
    if (result.success) {
      this.success = true;
      this.message = result.message;
    } else {
      this.message = result.message;
    }
  }

  resetForm(): void {
    this.email = '';
    this.message = '';
    this.success = false;
  }
}
