import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard.component';
import { CatalogComponent } from './catalog.component';
import { BorrowedComponent } from './borrowed.component';
import { FinesComponent } from './fines.component';
import { NotificationsComponent } from './notifications.component';

export const STUDENT_ROUTES: Routes = [
  { path: '', component: StudentDashboardComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'borrowed', component: BorrowedComponent },
  { path: 'fines', component: FinesComponent },
  { path: 'notifications', component: NotificationsComponent },
];
