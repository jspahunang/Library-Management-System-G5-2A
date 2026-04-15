import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  CollectionReference,
} from '@angular/fire/firestore';
import type { Admin, Librarian, Student, Teacher } from '../models';

/**
 * Role-specific entity lookups backed by dedicated Firestore collections.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private _admins = signal<Admin[]>([]);
  private _librarians = signal<Librarian[]>([]);
  private _students = signal<Student[]>([]);
  private _teachers = signal<Teacher[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      onSnapshot(collection(this.firestore, 'admins') as CollectionReference<Admin>, (s) =>
        this._admins.set(s.docs.map((d) => d.data() as Admin))
      );
      onSnapshot(collection(this.firestore, 'librarians') as CollectionReference<Librarian>, (s) =>
        this._librarians.set(s.docs.map((d) => d.data() as Librarian))
      );
      onSnapshot(collection(this.firestore, 'students') as CollectionReference<Student>, (s) =>
        this._students.set(s.docs.map((d) => d.data() as Student))
      );
      onSnapshot(collection(this.firestore, 'teachers') as CollectionReference<Teacher>, (s) =>
        this._teachers.set(s.docs.map((d) => d.data() as Teacher))
      );
    }
  }

  getAdmins(): Admin[] { return this._admins(); }
  getLibrarians(): Librarian[] { return this._librarians(); }
  getStudents(): Student[] { return this._students(); }
  getTeachers(): Teacher[] { return this._teachers(); }

  getStudentByUserId(userid: string): Student | undefined {
    return this._students().find((s) => s.userid === userid);
  }

  getStudentById(studentid: string): Student | undefined {
    return this._students().find((s) => s.studentid === studentid);
  }

  async addStudent(student: Student): Promise<void> {
    await setDoc(doc(this.firestore, 'students', student.studentid), student);
  }

  async addTeacher(teacher: Teacher): Promise<void> {
    await setDoc(doc(this.firestore, 'teachers', teacher.teacherid), teacher);
  }

  async addAdmin(admin: Admin): Promise<void> {
    await setDoc(doc(this.firestore, 'admins', admin.adminid), admin);
  }

  async addLibrarian(librarian: Librarian): Promise<void> {
    await setDoc(doc(this.firestore, 'librarians', librarian.librarianid), librarian);
  }
}
