import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  CollectionReference,
} from '@angular/fire/firestore';
import type { Notification } from '../models';

/**
 * Notifications for students backed by Firestore `notifications` collection.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private _notifications = signal<Notification[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const ref = collection(this.firestore, 'notifications') as CollectionReference<Notification>;
      onSnapshot(ref, (snapshot) => {
        this._notifications.set(snapshot.docs.map((d) => d.data() as Notification));
      });
    }
  }

  getAll(): Notification[] {
    return this._notifications();
  }

  getByStudent(studentid: string): Notification[] {
    return this._notifications()
      .filter((n) => n.studentid === studentid)
      .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  }

  getUnreadCount(studentid: string): number {
    return this.getByStudent(studentid).filter((n) => !n.read).length;
  }

  async add(notification: Omit<Notification, 'notificationid' | 'read'>): Promise<void> {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const n: Notification = { ...notification, notificationid: id, read: false };
    const ref = doc(this.firestore, 'notifications', id);
    await setDoc(ref, n);
  }

  async markAsRead(notificationid: string): Promise<void> {
    const ref = doc(this.firestore, 'notifications', notificationid);
    await updateDoc(ref, { read: true });
  }

  async markAllAsRead(studentid: string): Promise<void> {
    const unread = this.getByStudent(studentid).filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => updateDoc(doc(this.firestore, 'notifications', n.notificationid), { read: true }))
    );
  }
}
