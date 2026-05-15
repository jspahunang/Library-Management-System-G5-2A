import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoleService } from '../../core/services/role.service';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teacher-notifications',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './teacher-notifications.component.html',
  styleUrl: './teacher-notifications.component.scss',
})
export class TeacherNotificationsComponent {
  teacherId = computed(() => {
    const session = this.auth.currentSession();
    return session ? this.roleService.getTeacherByUserId(session.userid)?.teacherid : null;
  });

  notifications = computed(() => {
    const tid = this.teacherId();
    return tid ? this.notificationService.getByTeacher(tid) : [];
  });

  unreadCount = computed(() => {
    const tid = this.teacherId();
    return tid ? this.notificationService.getUnreadCountForTeacher(tid) : 0;
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
    const tid = this.teacherId();
    if (tid) {
      await this.notificationService.markAllAsReadForTeacher(tid);
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
