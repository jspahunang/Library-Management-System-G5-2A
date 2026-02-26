import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { Login } from '../models';

/**
 * Login credentials CRUD (for LocalStorage seed and admin user management).
 * This service is designed to be migrated to Firebase later (Firebase Auth).
 */
@Injectable({ providedIn: 'root' })
export class LoginService {
  private get storage() {
    return getLocalStorage();
  }

  getAll(): Login[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.LOGINS);
    return raw ? (JSON.parse(raw) as Login[]) : [];
  }

  getByUserId(userid: string): Login | undefined {
    return this.getAll().find((l) => l.userid === userid);
  }

  setAll(logins: Login[]): void {
    this.storage?.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(logins));
  }

  /** Reset password for the given email (demo: sets to a known temp password). */
  requestPasswordReset(email: string): { success: boolean; message: string; newPassword?: string } {
    const e = email?.trim() ?? '';
    if (!e) {
      return { success: false, message: 'Please enter your email.' };
    }
    const logins = this.getAll();
    const login = logins.find((l) => l.email.toLowerCase() === e.toLowerCase());
    if (!login) {
      return { success: false, message: 'No account found with that email.' };
    }
    const newPassword = 'password123';
    login.password = newPassword;
    this.setAll(logins);
    return { success: true, message: 'Password has been reset.', newPassword };
  }
}
