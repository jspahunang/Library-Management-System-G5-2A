import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Prevents authenticated users from accessing login page. Redirects to role dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  const session = auth.currentSession();
  const base = session ? `/${session.role.toLowerCase()}` : '/login';
  return router.createUrlTree([base]);
};
