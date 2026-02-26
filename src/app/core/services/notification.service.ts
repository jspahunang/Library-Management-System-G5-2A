import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { Notification } from '../models';

/**
 * Notifications for students (borrow, due reminder, overdue, fine issued).
 * This service is designed to be migrated to Firebase later (Firestore notifications + FCM optional).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private get storage() {
    return getLocalStorage();
  }

  getAll(): Notification[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? (JSON.parse(raw) as Notification[]) : [];
  }

  getByStudent(studentid: string): Notification[] {
    return this.getAll()
      .filter((n) => n.studentid === studentid)
      .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  }

  getUnreadCount(studentid: string): number {
    return this.getByStudent(studentid).filter((n) => !n.read).length;
  }

  add(notification: Omit<Notification, 'notificationid' | 'read'>): void {
    const n: Notification = {
      ...notification,
      notificationid: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
    };
    const list = this.getAll();
    list.push(n);
    this.storage?.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  markAsRead(notificationid: string): void {
    const list = this.getAll();
    const i = list.findIndex((n) => n.notificationid === notificationid);
    if (i === -1) return;
    list[i] = { ...list[i], read: true };
    this.storage?.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  markAllAsRead(studentid: string): void {
    const list = this.getAll();
    for (let i = 0; i < list.length; i++) {
      if (list[i].studentid === studentid && !list[i].read) list[i] = { ...list[i], read: true };
    }
    this.storage?.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  setAll(notifications: Notification[]): void {
    this.storage?.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
}
