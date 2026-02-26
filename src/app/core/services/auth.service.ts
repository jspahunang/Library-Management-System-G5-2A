import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import { UserService } from './user.service';
import type { User, UserRole } from '../models';

export interface Session {
  userid: string;
  role: UserRole;
  email: string;
  fullName: string;
}

/**
 * Authentication and session management.
 * This service is designed to be migrated to Firebase later (Firebase Auth + Firestore user profile).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private get storage() {
    return getLocalStorage();
  }

  private sessionSignal = signal<Session | null>(this.loadSessionFromStorage());

  currentSession = computed(() => this.sessionSignal());
  isLoggedIn = computed(() => this.sessionSignal() !== null);

  /** Use in route guards to get current auth state. */
  isAuthenticated(): boolean {
    return this.sessionSignal() !== null;
  }

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  private loadSessionFromStorage(): Session | null {
    const raw = this.storage?.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }

  private persistSession(session: Session | null): void {
    if (session) {
      this.storage?.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      this.storage?.removeItem(STORAGE_KEYS.SESSION);
    }
    this.sessionSignal.set(session);
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const e = email?.trim() ?? '';
    const p = password?.trim() ?? '';
    const loginsRaw = this.storage?.getItem(STORAGE_KEYS.LOGINS);
    const logins = loginsRaw ? (JSON.parse(loginsRaw) as { userid: string; email: string; password: string }[]) : [];
    const cred = logins.find((l) => l.email.toLowerCase() === e.toLowerCase() && l.password === p);
    if (!cred) {
      return { success: false, message: 'Invalid email or password.' };
    }
    const user = this.userService.getById(cred.userid);
    if (!user || user.status !== 'Active') {
      return { success: false, message: 'Account is inactive or not found.' };
    }
    const fullName = [user.Fname, user.Minitial, user.Lname].filter(Boolean).join(' ');
    const session: Session = {
      userid: user.userid,
      role: user.role,
      email: user.email,
      fullName,
    };
    this.persistSession(session);
    return { success: true, message: 'Login successful.' };
  }

  logout(): void {
    this.persistSession(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | undefined {
    const session = this.sessionSignal();
    return session ? this.userService.getById(session.userid) : undefined;
  }

  hasRole(role: UserRole): boolean {
    return this.sessionSignal()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const r = this.sessionSignal()?.role;
    return r ? roles.includes(r) : false;
  }
}
