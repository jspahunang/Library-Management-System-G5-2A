import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BorrowService } from '../../core/services/borrow.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-borrowed',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './borrowed.component.html',
  styleUrl: './borrowed.component.scss',
})
export class BorrowedComponent {
  studentId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getStudentByUserId(session.userid)?.studentid : null;
  });

  records = computed(() => {
    const sid = this.studentId();
    return sid ? this.borrowService.getByStudent(sid) : [];
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
