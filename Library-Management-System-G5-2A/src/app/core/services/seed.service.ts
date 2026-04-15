import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import {
  MOCK_USERS,
  MOCK_LOGINS,
  MOCK_ADMINS,
  MOCK_LIBRARIANS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_BOOKS,
  MOCK_BORROW_RECORDS,
  MOCK_FINES,
  MOCK_NOTIFICATIONS,
} from '../data/mock-data';

/**
 * Seeds LocalStorage with mock data if not already present.
 * Safe to call on app init; does not overwrite existing data.
 */
@Injectable({ providedIn: 'root' })
export class SeedService {
  private get storage() {
    return getLocalStorage();
  }

  seedIfEmpty(): void {
    if (!this.storage) return;
    if (this.storage.getItem(STORAGE_KEYS.USERS)) return; // already seeded
    this.seedAll();
  }

  /**
   * Unconditionally write mock users and logins to LocalStorage.
   * Call this when the login page loads so credentials are always present (fixes SSR / timing issues).
   */
  seedLoginData(): void {
    if (!this.storage) return;
    this.storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    this.storage.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(MOCK_LOGINS));
  }

  private seedAll(): void {
    if (!this.storage) return;
    this.storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    this.storage.setItem(STORAGE_KEYS.LOGINS, JSON.stringify(MOCK_LOGINS));
    this.storage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(MOCK_ADMINS));
    this.storage.setItem(STORAGE_KEYS.LIBRARIANS, JSON.stringify(MOCK_LIBRARIANS));
    this.storage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    this.storage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(MOCK_TEACHERS));
    this.storage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(MOCK_BOOKS));
    this.storage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(MOCK_BORROW_RECORDS));
    this.storage.setItem(STORAGE_KEYS.FINES, JSON.stringify(MOCK_FINES));
    this.storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
  }
}
