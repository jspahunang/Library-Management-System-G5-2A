import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserManagementComponent } from './user-management.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: UserManagementComponent },
];
