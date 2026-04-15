import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Optional: add auth token to outgoing requests when migrating to Firebase.
 * For LocalStorage-only auth, this can redirect unauthenticated API calls.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // When using Firebase, attach idToken: req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(req);
};
