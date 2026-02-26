import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { UserRole } from '../models';

/**
 * Factory that returns a guard allowing only the given roles.
 * Usage: canActivate: [roleGuard(['Admin', 'Librarian'])]
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasAnyRole(allowedRoles)) return true;
    const session = auth.currentSession();
    if (session) {
      const base = `/${session.role.toLowerCase()}`;
      return router.createUrlTree([base]);
    }
    return router.createUrlTree(['/login']);
  };
}
