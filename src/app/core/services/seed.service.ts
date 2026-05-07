import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from '@angular/fire/auth';
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
 * Seeds Firestore with mock data if not already present.
 */
@Injectable({ providedIn: 'root' })
export class SeedService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private platformId = inject(PLATFORM_ID);

  async seedIfEmpty(): Promise<void> {
    // Never seed during SSR / prerendering — no auth context exists server-side
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      // Check if we already seeded by looking for the first mock user
      const docRef = doc(this.firestore, 'users', MOCK_USERS[0].userid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Force update mock fines for this specific request to ensure DB is in sync with recent changes
        const tasks: Promise<void>[] = [];
        for (const f of MOCK_FINES) {
          tasks.push(setDoc(doc(this.firestore, 'fines', f.fineid), f));
        }
        await Promise.all(tasks);
        return; // Already seeded
      }

      await this.seedAll();
    } catch (e) {
      console.error('Seeding error:', e);
    }
  }

  seedLoginData(): void {
    // Ignored in Firebase migration — Auth handles logins now.
    // In a real scenario, you don't seed passwords directly into a database like LocalStorage.
  }

  private async seedAll(): Promise<void> {
    console.log('--- Seeding Firestore Data ---');
    
    // First, let's try to create actual Firebase Auth accounts for the mock users
    for (const login of MOCK_LOGINS) {
      try {
        const methods = await fetchSignInMethodsForEmail(this.auth, login.email);
        if (methods.length === 0) {
          await createUserWithEmailAndPassword(this.auth, login.email, login.password);
        }
      } catch (err: any) {
        // Ignored. They likely already exist or fetch methods fails depending on security settings.
        try {
          await createUserWithEmailAndPassword(this.auth, login.email, login.password);
        } catch { } // completely ignore already exists error
      }
    }

    const tasks: Promise<void>[] = [];

    // Seed users
    for (const user of MOCK_USERS) {
      tasks.push(setDoc(doc(this.firestore, 'users', user.userid), user));
    }
    // Seed admins
    for (const admin of MOCK_ADMINS) {
      tasks.push(setDoc(doc(this.firestore, 'admins', admin.adminid), admin));
    }
    // Seed librarians
    for (const lib of MOCK_LIBRARIANS) {
      tasks.push(setDoc(doc(this.firestore, 'librarians', lib.librarianid), lib));
    }
    // Seed students
    for (const stu of MOCK_STUDENTS) {
      tasks.push(setDoc(doc(this.firestore, 'students', stu.studentid), stu));
    }
    // Seed teachers
    for (const t of MOCK_TEACHERS) {
      tasks.push(setDoc(doc(this.firestore, 'teachers', t.teacherid), t));
    }
    // Seed books
    for (const b of MOCK_BOOKS) {
      tasks.push(setDoc(doc(this.firestore, 'books', b.bookid), b));
    }
    // Seed borrow records
    for (const br of MOCK_BORROW_RECORDS) {
      tasks.push(setDoc(doc(this.firestore, 'borrow_records', br.borrowid), br));
    }
    // Seed fines
    for (const f of MOCK_FINES) {
      tasks.push(setDoc(doc(this.firestore, 'fines', f.fineid), f));
    }
    // Seed notifications
    for (const n of MOCK_NOTIFICATIONS) {
      tasks.push(setDoc(doc(this.firestore, 'notifications', n.notificationid), n));
    }

    await Promise.all(tasks);
    console.log('--- Seeding Firestore Data Complete ---');
  }
}
