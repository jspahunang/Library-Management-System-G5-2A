import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-librarian-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './librarian-notifications.component.html',
  styleUrl: './librarian-notifications.component.scss',
})
export class LibrarianNotificationsComponent {
  allNotifications = computed(() => this.notificationService.getAll().sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
  searchStudentId = signal('');
  filtered = computed(() => {
    const sid = this.searchStudentId().trim();
    const list = this.allNotifications();
    return sid ? list.filter((n) => n.studentid === sid) : list;
  });

  students = computed(() => this.roleService.getStudents());
  sendForm = signal({ studentid: '', messageTitle: '', message: '' });
  sendMessage = signal('');

  constructor(
    private notificationService: NotificationService,
    private roleService: RoleService
  ) {}

  sendNotification(): void {
    const f = this.sendForm();
    if (!f.studentid || !f.messageTitle.trim() || !f.message.trim()) {
      this.sendMessage.set('Please fill student, title, and message.');
      return;
    }
    this.notificationService.add({
      studentid: f.studentid,
      messageTitle: f.messageTitle.trim(),
      message: f.message.trim(),
      timestamp: new Date().toISOString(),
    });
    this.sendForm.set({ studentid: '', messageTitle: '', message: '' });
    this.sendMessage.set('Notification sent.');
  }

  setSendField(field: 'studentid' | 'messageTitle' | 'message', value: string): void {
    this.sendForm.update((prev) => ({ ...prev, [field]: value }));
  }
}
