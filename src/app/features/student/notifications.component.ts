import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  studentId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getStudentByUserId(session.userid)?.studentid : null;
  });

  notifications = computed(() => {
    const sid = this.studentId();
    return sid ? this.notificationService.getByStudent(sid) : [];
  });

  unreadCount = computed(() => {
    const sid = this.studentId();
    return sid ? this.notificationService.getUnreadCount(sid) : 0;
  });

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllRead(): void {
    const sid = this.studentId();
    if (sid) this.notificationService.markAllAsRead(sid);
  }
}
