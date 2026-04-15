import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { Admin, Librarian, Student, Teacher } from '../models';

/**
 * Role-specific entity lookups (Admin, Librarian, Student, Teacher).
 * This service is designed to be migrated to Firebase later (Firestore collections).
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private get storage() {
    return getLocalStorage();
  }

  getAdmins(): Admin[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.ADMINS);
    return raw ? (JSON.parse(raw) as Admin[]) : [];
  }

  getLibrarians(): Librarian[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.LIBRARIANS);
    return raw ? (JSON.parse(raw) as Librarian[]) : [];
  }

  getStudents(): Student[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? (JSON.parse(raw) as Student[]) : [];
  }

  getTeachers(): Teacher[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.TEACHERS);
    return raw ? (JSON.parse(raw) as Teacher[]) : [];
  }

  getStudentByUserId(userid: string): Student | undefined {
    return this.getStudents().find((s) => s.userid === userid);
  }

  getStudentById(studentid: string): Student | undefined {
    return this.getStudents().find((s) => s.studentid === studentid);
  }

  setAdmins(admins: Admin[]): void {
    this.storage?.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  }

  setLibrarians(librarians: Librarian[]): void {
    this.storage?.setItem(STORAGE_KEYS.LIBRARIANS, JSON.stringify(librarians));
  }

  setStudents(students: Student[]): void {
    this.storage?.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  setTeachers(teachers: Teacher[]): void {
    this.storage?.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }
}
