import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { CatalogComponent } from '../student/catalog.component';
import { TeacherHistoryComponent } from './teacher-history.component';

export const TEACHER_ROUTES: Routes = [
  { path: '', component: TeacherDashboardComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'history', component: TeacherHistoryComponent },
];
