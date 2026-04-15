import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
} from '@angular/fire/firestore';
import type { User, UserRole } from '../models';

export interface Session {
  userid: string;
  role: UserRole;
  email: string;
  fullName: string;
}

/**
 * Authentication and session management via Firebase Auth + Firestore user profiles.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  private sessionSignal = signal<Session | null>(null);

  currentSession = computed(() => this.sessionSignal());
  isLoggedIn = computed(() => this.sessionSignal() !== null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Restore session automatically from Firebase Auth state on page load
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser?.email) {
          const usersRef = collection(this.firestore, 'users') as CollectionReference<User>;
          const q = query(usersRef, where('email', '==', firebaseUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            if (userData.status === 'Active') {
              const fullName = [userData.Fname, userData.Minitial, userData.Lname]
                .filter(Boolean)
                .join(' ');
              this.sessionSignal.set({
                userid: userData.userid,
                role: userData.role,
                email: userData.email,
                fullName,
              });
            } else {
              // Account is inactive — sign out immediately
              await signOut(this.auth);
              this.sessionSignal.set(null);
            }
          }
        } else {
          this.sessionSignal.set(null);
        }
      });
    }
  }

  /** Use in route guards to get current auth state. */
  isAuthenticated(): boolean {
    return this.sessionSignal() !== null;
  }

  /** Sign in with Firebase Auth and load user profile from Firestore. */
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const e = email?.trim() ?? '';
    const p = password?.trim() ?? '';
    try {
      await signInWithEmailAndPassword(this.auth, e, p);
      // onAuthStateChanged will automatically set the session signal
      return { success: true, message: 'Login successful.' };
    } catch (err: any) {
      const code: string = err?.code ?? '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        return { success: false, message: 'Invalid email or password.' };
      }
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.sessionSignal.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this.sessionSignal()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const r = this.sessionSignal()?.role;
    return r ? roles.includes(r) : false;
  }
}
