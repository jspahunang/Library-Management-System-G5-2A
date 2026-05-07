import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoleService } from '../../core/services/role.service';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ButtonModule],
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
  ) { }

  async markAsRead(id: string): Promise<void> {
    await this.notificationService.markAsRead(id);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Notification marked as read',
      showConfirmButton: false,
      timer: 2000
    });
  }

  async markAllRead(): Promise<void> {
    const sid = this.studentId();
    if (sid) {
      await this.notificationService.markAllAsRead(sid);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'All notifications marked as read',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }
}
