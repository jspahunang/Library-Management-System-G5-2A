import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BorrowService } from '../../core/services/borrow.service';
import { FineService } from '../../core/services/fine.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent {
  studentId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getStudentByUserId(session.userid)?.studentid : null;
  });

  borrowedCount = computed(() => {
    const sid = this.studentId();
    return sid ? this.borrowService.getActiveByStudent(sid).length : 0;
  });

  overdueCount = computed(() => {
    const sid = this.studentId();
    if (!sid) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return this.borrowService.getActiveByStudent(sid).filter((b) => b.duedate < today).length;
  });

  totalFines = computed(() => {
    const sid = this.studentId();
    return sid ? this.fineService.getTotalUnpaidAmount(sid) : 0;
  });

  unreadNotifications = computed(() => {
    const sid = this.studentId();
    return sid ? this.notificationService.getUnreadCount(sid) : 0;
  });

  recentBorrows = computed(() => {
    const sid = this.studentId();
    if (!sid) return [];
    return this.borrowService.getByStudent(sid).slice(0, 5);
  });

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private borrowService: BorrowService,
    private fineService: FineService,
    private notificationService: NotificationService
  ) {}
}
