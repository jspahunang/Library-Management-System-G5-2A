import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BorrowService } from '../../core/services/borrow.service';
import { RoleService } from '../../core/services/role.service';

import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-teacher-history',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, TableModule],
  templateUrl: './teacher-history.component.html',
  styleUrl: './teacher-history.component.scss',
})
export class TeacherHistoryComponent {
  teacherId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getTeacherByUserId(session.userid)?.teacherid : null;
  });

  records = computed(() => {
    const tid = this.teacherId();
    if (!tid) return [];
    return this.borrowService.getByStudent(tid)
      .sort((a, b) => new Date(b.borrowdate).getTime() - new Date(a.borrowdate).getTime());
  });

  activeCount = computed(() =>
    this.records().filter((r) => r.status === 'Borrowed' || r.status === 'Overdue').length
  );

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private borrowService: BorrowService
  ) {}
}
