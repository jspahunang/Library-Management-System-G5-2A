import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { User } from '../models';

/**
 * User CRUD and lookup.
 * This service is designed to be migrated to Firebase later (Firestore users collection).
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private get storage() {
    return getLocalStorage();
  }

  private _users = signal<User[]>(this.load());

  private load(): User[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.USERS);
    return raw ? (JSON.parse(raw) as User[]) : [];
  }

  getAll(): User[] {
    return this._users();
  }

  getById(userid: string): User | undefined {
    return this.getAll().find((u) => u.userid === userid);
  }

  getByRole(role: User['role']): User[] {
    return this.getAll().filter((u) => u.role === role);
  }

  add(user: User): void {
    const list = this.getAll();
    if (list.some((u) => u.userid === user.userid)) return;
    const newList = [...list, user];
    this._users.set(newList);
    this.storage?.setItem(STORAGE_KEYS.USERS, JSON.stringify(newList));
  }

  update(userid: string, updates: Partial<User>): void {
    const list = [...this.getAll()];
    const i = list.findIndex((u) => u.userid === userid);
    if (i === -1) return;
    list[i] = { ...list[i], ...updates };
    this._users.set(list);
    this.storage?.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  }

  delete(userid: string): void {
    const newList = this.getAll().filter((u) => u.userid !== userid);
    this._users.set(newList);
    this.storage?.setItem(STORAGE_KEYS.USERS, JSON.stringify(newList));
  }

  setAll(users: User[]): void {
    this._users.set(users);
    this.storage?.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}
