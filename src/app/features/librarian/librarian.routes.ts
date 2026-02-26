import { Routes } from '@angular/router';
import { LibrarianDashboardComponent } from './librarian-dashboard.component';
import { BookManagementComponent } from './book-management.component';
import { TransactionsComponent } from './transactions.component';
import { LibrarianFinesComponent } from './librarian-fines.component';
import { LibrarianNotificationsComponent } from './librarian-notifications.component';

export const LIBRARIAN_ROUTES: Routes = [
  { path: '', component: LibrarianDashboardComponent },
  { path: 'books', component: BookManagementComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'fines', component: LibrarianFinesComponent },
  { path: 'notifications', component: LibrarianNotificationsComponent },
];
