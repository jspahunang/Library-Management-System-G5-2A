import { Injectable, inject } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

/**
 * Login service for handling password resets via Firebase Auth.
 */
@Injectable({ providedIn: 'root' })
export class LoginService {
  private auth = inject(Auth);

  /** Request password reset email. */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const e = email?.trim() ?? '';
    if (!e) {
      return { success: false, message: 'Please enter your email.' };
    }
    try {
      await sendPasswordResetEmail(this.auth, e);
      return { success: true, message: 'Password reset email sent. Please check your inbox.' };
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Don't leak whether email exists or not usually, but for UX:
      return { success: false, message: 'Failed to send reset email. Verify the email is correct.' };
    }
  }
}
