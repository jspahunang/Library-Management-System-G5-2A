import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardLayoutComponent } from './features/layout/dashboard-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'demo-credentials',
    loadComponent: () => import('./features/demo-credentials/demo-credentials.component').then((m) => m.DemoCredentialsComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'student',
    loadComponent: () => import('./features/layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard, roleGuard(['Student'])],
    loadChildren: () => import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
  },
  {
    path: 'librarian',
    loadComponent: () => import('./features/layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard, roleGuard(['Librarian'])],
    loadChildren: () => import('./features/librarian/librarian.routes').then((m) => m.LIBRARIAN_ROUTES),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'teacher',
    loadComponent: () => import('./features/layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard, roleGuard(['Teacher'])],
    loadChildren: () => import('./features/teacher/teacher.routes').then((m) => m.TEACHER_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
